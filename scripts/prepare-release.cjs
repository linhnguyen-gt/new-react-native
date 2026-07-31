#!/usr/bin/env node

/**
 * Decides the next version and writes the release notes, from the conventional commits since
 * the previous tag.
 *
 * It exists because `gh release create --generate-notes` hands the job to GitHub, which groups
 * by pull request rather than by change, and on a repository's first tag has no previous tag to
 * diff against — so it walks the entire history and announces the owner as a first-time
 * contributor. Reading the commits ourselves gives the same automation with notes that match
 * the commit discipline commitlint already enforces.
 *
 * Usage:
 *   node scripts/prepare-release.cjs --bump=auto|patch|minor|major
 *   node scripts/prepare-release.cjs --version=1.2.3     # exact, overrides --bump
 *   node scripts/prepare-release.cjs --bump=auto --dry-run
 *
 * Writes `version`, `tag`, `previous_tag`, `commit_count` and `notes_file` to $GITHUB_OUTPUT,
 * and the notes to a file outside the working tree. `--dry-run` writes neither package.json nor
 * the outputs, and prints the notes to stdout instead.
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');

const REPO_ROOT = path.join(__dirname, '..');
const PACKAGE_JSON = path.join(REPO_ROOT, 'package.json');

/** Conventional-commit types in the order they should appear, with their heading. */
const SECTIONS = [
    { type: 'feat', heading: 'Features' },
    { type: 'fix', heading: 'Fixes' },
    { type: 'perf', heading: 'Performance' },
    { type: 'refactor', heading: 'Refactoring' },
    { type: 'test', heading: 'Tests' },
    { type: 'docs', heading: 'Documentation' },
    { type: 'build', heading: 'Build' },
    { type: 'ci', heading: 'CI' },
    { type: 'style', heading: 'Style' },
    { type: 'chore', heading: 'Chores' },
];

const git = (...args) =>
    // stderr is inherited so a real failure is visible, except where the caller expects one.
    execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim();

/** Same, but silent on failure — for the commands whose failure is a legitimate answer. */
const gitQuiet = (...args) =>
    execFileSync('git', args, { cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();

const fail = (message) => {
    console.error(`prepare-release: ${message}`);
    process.exit(1);
};

const parseArgs = (argv) => {
    const args = { bump: 'auto', version: '', dryRun: false };

    for (const arg of argv) {
        if (arg === '--dry-run') args.dryRun = true;
        else if (arg.startsWith('--bump=')) args.bump = arg.slice('--bump='.length);
        else if (arg.startsWith('--version=')) args.version = arg.slice('--version='.length);
        else fail(`unknown argument: ${arg}`);
    }

    if (!['auto', 'patch', 'minor', 'major'].includes(args.bump)) {
        fail(`--bump must be auto, patch, minor or major (got "${args.bump}")`);
    }
    if (args.version && !/^\d+\.\d+\.\d+$/.test(args.version)) {
        fail(`--version must be x.y.z (got "${args.version}")`);
    }

    return args;
};

/** The most recent tag reachable from HEAD, or null on a repository that has never been tagged. */
const previousTag = () => {
    try {
        return gitQuiet('describe', '--tags', '--abbrev=0');
    } catch {
        return null;
    }
};

/**
 * Commits since `fromTag`, newest first. `%x1f` and `%x1e` are unit and record separators —
 * a subject can contain anything, including the newlines a naive split would break on.
 */
const commitsSince = (fromTag) => {
    const range = fromTag ? `${fromTag}..HEAD` : 'HEAD';
    const raw = git('log', range, '--no-merges', '--pretty=format:%h%x1f%s%x1f%b%x1e');
    if (!raw) return [];

    return raw
        .split('\x1e')
        .map((record) => record.trim())
        .filter(Boolean)
        .map((record) => {
            const [sha, subject, body] = record.split('\x1f');
            return { sha, subject, body: body ?? '' };
        });
};

/** `type(scope)!: subject` — anything that does not match is kept as an uncategorised entry. */
const classify = ({ sha, subject, body }) => {
    const match = /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<description>.+)$/.exec(subject);
    const isBreaking = Boolean(match?.groups.breaking) || /^BREAKING[ -]CHANGE:/m.test(body);

    return {
        sha,
        type: match?.groups.type ?? null,
        scope: match?.groups.scope ?? null,
        description: match?.groups.description ?? subject,
        isBreaking,
    };
};

/**
 * A breaking change is a major, a feature is a minor, anything else is a patch — the plain
 * conventional-commits rule. Below 1.0.0 a breaking change is still only a minor, which is what
 * the "anything may change" clause of semver means in practice.
 */
const inferBump = (commits, currentMajor) => {
    if (commits.some((commit) => commit.isBreaking)) return currentMajor === 0 ? 'minor' : 'major';
    if (commits.some((commit) => commit.type === 'feat')) return 'minor';
    return 'patch';
};

const applyBump = (version, bump) => {
    const [major, minor, patch] = version.split('.').map(Number);
    if (bump === 'major') return `${major + 1}.0.0`;
    if (bump === 'minor') return `${major}.${minor + 1}.0`;
    return `${major}.${minor}.${patch + 1}`;
};

const renderNotes = (commits, { tag, previous, repository }) => {
    const line = ({ sha, scope, description }) => `- ${scope ? `**${scope}:** ` : ''}${description} (${sha})`;
    const lines = [];

    const breaking = commits.filter((commit) => commit.isBreaking);
    if (breaking.length > 0) {
        lines.push('## Breaking changes', '', ...breaking.map(line), '');
    }

    for (const { type, heading } of SECTIONS) {
        // A breaking commit is listed once, under Breaking changes.
        const matching = commits.filter((commit) => commit.type === type && !commit.isBreaking);
        if (matching.length > 0) {
            lines.push(`## ${heading}`, '', ...matching.map(line), '');
        }
    }

    const known = new Set(SECTIONS.map((section) => section.type));
    const other = commits.filter((commit) => !commit.isBreaking && !known.has(commit.type));
    if (other.length > 0) {
        lines.push('## Other', '', ...other.map(line), '');
    }

    if (lines.length === 0) {
        lines.push('No commits since the previous release.', '');
    }

    if (repository) {
        const compare = previous
            ? `https://github.com/${repository}/compare/${previous}...${tag}`
            : `https://github.com/${repository}/commits/${tag}`;
        lines.push(`**Full changelog:** ${compare}`);
    }

    return `${lines.join('\n')}\n`;
};

const main = () => {
    const args = parseArgs(process.argv.slice(2));

    const packageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON, 'utf8'));
    const currentVersion = packageJson.version;

    const previous = previousTag();
    const commits = commitsSince(previous)
        .map(classify)
        // The previous run's own version commit is bookkeeping, not a change worth announcing.
        .filter((commit) => !(commit.type === 'chore' && commit.scope === 'release'));

    const bump = args.bump === 'auto' ? inferBump(commits, Number(currentVersion.split('.')[0])) : args.bump;
    const version = args.version || applyBump(currentVersion, bump);
    const tag = `v${version}`;

    if (version === currentVersion) {
        fail(`the computed version ${version} is the one already in package.json`);
    }

    const notes = renderNotes(commits, { tag, previous, repository: process.env.GITHUB_REPOSITORY });
    // Outside the working tree on purpose: a notes file inside the repository would show up in
    // `git status` and could be committed by a careless `git add -A` in a later step.
    const notesFile = path.join(process.env.RUNNER_TEMP || os.tmpdir(), `release-notes-${tag}.md`);

    if (args.dryRun) {
        console.log(`version:      ${currentVersion} -> ${version} (${args.version ? 'exact' : bump})`);
        console.log(`tag:          ${tag}`);
        console.log(`previous tag: ${previous ?? '(none)'}`);
        console.log(`commits:      ${commits.length}`);
        console.log(`\n${notes}`);
        return;
    }

    fs.writeFileSync(notesFile, notes);
    packageJson.version = version;
    fs.writeFileSync(PACKAGE_JSON, `${JSON.stringify(packageJson, null, 4)}\n`);

    if (process.env.GITHUB_OUTPUT) {
        fs.appendFileSync(
            process.env.GITHUB_OUTPUT,
            [
                `version=${version}`,
                `tag=${tag}`,
                `previous_tag=${previous ?? ''}`,
                `commit_count=${commits.length}`,
                `notes_file=${notesFile}`,
                '',
            ].join('\n')
        );
    }

    console.log(`${currentVersion} -> ${version} (${tag}), ${commits.length} commits since ${previous ?? 'the start'}`);
};

main();

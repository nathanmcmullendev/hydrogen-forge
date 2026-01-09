import { Octokit } from '@octokit/rest';

interface SyncConfig {
  owner: string;
  repo: string;
  token: string;
}

// Tool: Pull current context from GitHub
export async function claude_context_pull(config: SyncConfig) {
  const octokit = new Octokit({ auth: config.token });

  const { data } = await octokit.repos.getContent({
    owner: config.owner,
    repo: config.repo,
    path: '.claude/CONTEXT.md'
  });

  if ('content' in data) {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
  throw new Error('CONTEXT.md not found');
}

// Tool: Push updated context to GitHub
export async function claude_context_push(
  config: SyncConfig,
  content: string,
  message: string
) {
  const octokit = new Octokit({ auth: config.token });

  // Get current SHA
  const { data: current } = await octokit.repos.getContent({
    owner: config.owner,
    repo: config.repo,
    path: '.claude/CONTEXT.md'
  });

  const sha = 'sha' in current ? current.sha : undefined;

  // Update file
  await octokit.repos.createOrUpdateFileContents({
    owner: config.owner,
    repo: config.repo,
    path: '.claude/CONTEXT.md',
    message: `chore(context): ${message} [SYNC]`,
    content: Buffer.from(content).toString('base64'),
    sha
  });

  return { success: true };
}

// Tool: Create session log
export async function claude_session_log(
  config: SyncConfig,
  sessionId: string,
  content: string
) {
  const octokit = new Octokit({ auth: config.token });

  const date = new Date().toISOString().split('T')[0];
  const path = `.sessions/logs/${date}-${sessionId}.md`;

  await octokit.repos.createOrUpdateFileContents({
    owner: config.owner,
    repo: config.repo,
    path,
    message: `docs(session): add ${date} ${sessionId} log [SYNC]`,
    content: Buffer.from(content).toString('base64')
  });

  return { success: true, path };
}

// Tool: Get project-specific instructions
export async function claude_project_config(
  config: SyncConfig,
  role: 'architect' | 'hydrogen' | 'tooling' | 'docs' | 'manager'
) {
  const octokit = new Octokit({ auth: config.token });

  const { data } = await octokit.repos.getContent({
    owner: config.owner,
    repo: config.repo,
    path: `.claude/projects/${role}.md`
  });

  if ('content' in data) {
    return Buffer.from(data.content, 'base64').toString('utf-8');
  }
  throw new Error(`${role}.md not found`);
}

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SoulService implements OnModuleInit {
  private readonly logger = new Logger(SoulService.name);
  private readonly promptsDir: string;
  private readonly prompts = new Map<string, string>();

  constructor() {
    this.promptsDir = path.resolve(__dirname, 'prompts');
  }

  onModuleInit() {
    this.loadAllPrompts();
  }

  getSystemPrompt(skillInstructions?: string): string {
    const parts: string[] = [];

    const identity = this.prompts.get('identity');
    if (identity) parts.push(identity);

    const rules = this.prompts.get('rules');
    if (rules) parts.push(rules);

    const format = this.prompts.get('format');
    if (format) parts.push(format);

    if (skillInstructions?.trim()) {
      parts.push(`# Tool Instructions\n\n${skillInstructions}`);
    }

    return parts.join('\n\n---\n\n');
  }

  getPrompt(name: string): string | undefined {
    return this.prompts.get(name);
  }

  // ── Private ─────────────────────────────────────────────

  private loadAllPrompts(): void {
    if (!fs.existsSync(this.promptsDir)) {
      this.logger.warn(
        `Soul prompts directory not found: ${this.promptsDir}`,
      );
      return;
    }

    const files = fs
      .readdirSync(this.promptsDir)
      .filter((f) => f.endsWith('.md'));

    for (const file of files) {
      const name = path.basename(file, '.md');
      const content = fs.readFileSync(
        path.join(this.promptsDir, file),
        'utf-8',
      );
      this.prompts.set(name, content.trim());
      this.logger.debug(`Loaded soul prompt: ${name}`);
    }

    this.logger.log(
      `Loaded ${this.prompts.size} soul prompt(s): [${Array.from(this.prompts.keys()).join(', ')}]`,
    );
  }
}

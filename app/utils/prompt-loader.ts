import fs from 'fs';
import path from 'path';

export function loadCodePrompt(): string {
    try {
        const promptPath = path.join(process.cwd(), 'app', 'config', 'code-prompt.xml');
        const xmlContent = fs.readFileSync(promptPath, 'utf-8');
        // Extract content between <system_prompt> tags
        const match = xmlContent.match(/<system_prompt>([\s\S]*?)<\/system_prompt>/);
        if (match && match[1]) {
            return match[1].trim();
        }
        // Fallback to default code prompt if XML parsing fails
        return 'You are a helpful AI coding assistant.';
    } catch (error) {
        console.error('Error loading code prompt:', error);
        return 'You are a helpful AI coding assistant.';
    }
}

export function loadDecisionPrompt(): string {
    try {
        const promptPath = path.join(process.cwd(), 'app', 'config', 'decision-prompt.xml');
        const xmlContent = fs.readFileSync(promptPath, 'utf-8');
        // Extract content between <system_prompt> tags
        const match = xmlContent.match(/<system_prompt>([\s\S]*?)<\/system_prompt>/);
        if (match && match[1]) {
            return match[1].trim();
        }
        // Fallback to default decision prompt if XML parsing fails
        return 'You are an intelligent code generation orchestrator.';
    } catch (error) {
        console.error('Error loading decision prompt:', error);
        return 'You are an intelligent code generation orchestrator.';
    }
}

export function loadPromptByType(type: 'code' | 'decision'): string {
    switch (type) {
        case 'decision':
            return loadDecisionPrompt();
        case 'code':
        default:
            return loadCodePrompt();
    }
} 
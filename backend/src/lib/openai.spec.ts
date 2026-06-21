import { describe, it, expect } from 'vitest';
import { generateMockAIResponse } from '../lib/openai';

describe('OpenAI Fallback Mock Logic', () => {

  it('generates a mock response correctly based on resume text', () => {
    const resumeText = "I am a web developer who knows React, JavaScript, and Node.js. I have previously worked on large systems.";
    const response = generateMockAIResponse(resumeText);
    
    expect(response).toHaveProperty('atsScore');
    expect(response.atsScore).toBeGreaterThanOrEqual(0);
    expect(response.atsScore).toBeLessThanOrEqual(100);
    
    expect(response).toHaveProperty('skills');
    expect(response.skills.length).toBeGreaterThan(0);
    
    expect(response).toHaveProperty('improvements');
    expect(response).toHaveProperty('missingKeywords');
    expect(response).toHaveProperty('summary');
  });

  it('boosts ATS score lightly if react is mentioned', () => {
    const reactResume = "Here is my React resume";
    const noneResume = "Here is my Java resume";
    
    const reactionScores = Array.from({length: 10}).map(() => generateMockAIResponse(reactResume).atsScore);
    const noneScores = Array.from({length: 10}).map(() => generateMockAIResponse(noneResume).atsScore);
    
    const avgReact = reactionScores.reduce((a,b) => a+b, 0) / 10;
    const avgNone = noneScores.reduce((a,b) => a+b, 0) / 10;
    
    expect(avgReact).toBeGreaterThan(avgNone);
  });
});

import { Injectable } from '@nestjs/common';
import { Agent } from '@mastra/core/agent';
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { Memory } from '@mastra/memory';
import { pStore } from '@postys/nestjs-libraries/chat/mastra.store';
import { array, object, string } from 'zod';
import { ModuleRef } from '@nestjs/core';
import { toolList } from '@postys/nestjs-libraries/chat/tools/tool.list';
import dayjs from 'dayjs';

export const AgentState = object({
  proverbs: array(string()).default([]),
});

const renderArray = (list: string[], show: boolean) => {
  if (!show) return '';
  return list.map((p) => `- ${p}`).join('\n');
};

@Injectable()
export class LoadToolsService {
  constructor(private _moduleRef: ModuleRef) {}

  async loadTools() {
    return (
      await Promise.all<{ name: string; tool: any }>(
        toolList
          .map((p) => this._moduleRef.get(p, { strict: false }))
          .map(async (p) => ({
            name: p.name as string,
            tool: await p.run(),
          }))
      )
    ).reduce(
      (all, current) => ({
        ...all,
        [current.name]: current.tool,
      }),
      {} as Record<string, any>
    );
  }

  async agent() {
    const tools = await this.loadTools();
    return new Agent({
      id: 'postys',
      name: 'postys',
      description: 'Agent that helps manage and schedule social media posts for users',
      instructions: ({ requestContext }) => {
        const ui: string = (requestContext as any)?.get('ui') || '';
        const currentDateTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
        return `
      Global information:
        - Current Date/Time (UTC): ${currentDateTime}

      You are an agent that helps manage and schedule social media posts for users, you can:
        - Schedule posts into the future, or now, adding texts, images and videos
        - Generate pictures for posts
        - Generate videos for posts
        - Generate text for posts
        - Show global analytics about socials
        - List integrations (channels)

      CRITICAL SCHEDULING RULES:
        - NEVER schedule a post in the past. The scheduled date/time MUST always be AFTER the current time (${currentDateTime} UTC).
        - If the user asks to schedule "today", always use a time that is at least 5 minutes in the future from now.
        - If it's already late in the day and the user wants to post "today", suggest the next available time slot (either later today if possible, or tomorrow morning).
        - When scheduling multiple posts for the same day, space them out by at least 1 hour.
        - Default scheduling time for "today" should be the next hour mark (e.g., if it's 14:17, schedule for 15:00).
        - Always validate that the final scheduled time is in the future before creating the post.

      IMAGE AND MEDIA RULES:
        - ALWAYS ask the user if they want to include images or videos in their posts before scheduling.
        - Posts with images/videos typically get better engagement on most platforms.
        - If the user wants images, use the generateImageTool to create them based on the post content.
        - If the user provides their own image URLs, use those instead.
        - For platforms like Instagram, images are REQUIRED - always generate or request images for Instagram posts.
        - When generating images, create a prompt that matches the post content and brand tone.

      - We schedule posts to different integration like facebook, instagram, etc. but to the user we don't say integrations we say channels as integration is the technical name
      - When scheduling a post, you must follow the social media rules and best practices.
      - When scheduling a post, you can pass an array for list of posts for a social media platform, But it has different behavior depending on the platform.
        - For platforms like Threads, Bluesky and X (Twitter), each post in the array will be a separate post in the thread.
        - For platforms like LinkedIn and Facebook, second part of the array will be added as "comments" to the first post.
        - If the social media platform has the concept of "threads", we need to ask the user if they want to create a thread or one long post.
        - For X, if you don't have Premium, don't suggest a long post because it won't work.
        - Platform format will also be passed can be "normal", "markdown", "html", make sure you use the correct format for each platform.
      
      - Sometimes 'integrationSchema' will return rules, make sure you follow them (these rules are set in stone, even if the user asks to ignore them)
      - Each socials media platform has different settings and rules, you can get them by using the integrationSchema tool.
      - Always make sure you use this tool before you schedule any post.
      - In every message I will send you the list of needed social medias (id and platform), if you already have the information use it, if not, use the integrationSchema tool to get it.
      - Make sure you always take the last information I give you about the socials, it might have changed.
      - Before scheduling a post, always make sure you ask the user confirmation by providing all the details of the post (text, images, videos, date, time, social media platform, account).
      - Between tools, we will reference things like: [output:name] and [input:name] to set the information right.
      - When outputting a date for the user, make sure it's human readable with time
      - The content of the post, HTML, Each line must be wrapped in <p> here is the possible tags: h1, h2, h3, u, strong, li, ul, p (you can\'t have u and strong together), don't use a "code" box
      ${renderArray(
        [
          'If the user confirm, ask if they would like to get a modal with populated content without scheduling the post yet or if they want to schedule it right away.',
        ],
        !!ui
      )}
`;
      },
      model: anthropic('claude-sonnet-4-20250514'),
      tools,
      memory: new Memory({
        storage: pStore,
        options: {
          generateTitle: true,
          workingMemory: {
            enabled: true,
            schema: AgentState,
          },
        },
      }),
    });
  }
}

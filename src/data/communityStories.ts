import type { CommunityStory } from '../types/babio'

export const communityStories: CommunityStory[] = [
  {
    id: 'night-wake-after-feed',
    topic: 'night-wakes',
    topicLabel: 'Night wakes',
    ageRangeLabel: '8-10 weeks',
    title: 'My baby woke again after a calm feed.',
    summary: 'Parents often recognize the loop: feed, short quiet stretch, then another wake.',
    parentSignal: '18 parents saved this moment',
    askPrompt: 'Emma woke again after a calm feed. What is one calm next step tonight?',
    safetyNote:
      'Parent stories are shared moments, not clinical advice. Babio checks Emma’s profile and recent log before suggesting a next step.',
  },
  {
    id: 'still-unsettled-after-feed',
    topic: 'feeding',
    topicLabel: 'Feeding',
    ageRangeLabel: '0-12 weeks',
    title: 'She fed, but still seemed unsettled.',
    summary: 'Some parents noticed timing, burping, position, and diapers all mattered together.',
    parentSignal: '12 parents compared this pattern',
    askPrompt: 'Emma fed recently and still seems unsettled. What should I check first?',
    safetyNote:
      'Shared experiences can help you name the moment. Babio still uses Emma’s age, feeding style, and latest log.',
  },
  {
    id: 'evening-crying-window',
    topic: 'crying',
    topicLabel: 'Crying',
    ageRangeLabel: '6-12 weeks',
    title: 'Evenings felt harder than the rest of the day.',
    summary: 'A repeated evening window can feel confusing when every soothing tactic blends together.',
    parentSignal: '21 parents saved a low-stimulation reset',
    askPrompt: 'Emma gets unsettled in the evening. What is one low-stimulation step to try first?',
    safetyNote:
      'Babio does not rank parent advice. It turns the shared moment into a structured question for Emma.',
  },
  {
    id: 'short-nap-reset',
    topic: 'routine',
    topicLabel: 'Routine',
    ageRangeLabel: '2-5 months',
    title: 'The nap ended before I knew what to do next.',
    summary: 'Short naps can make the next choice feel rushed: reset, feed, play, or pause.',
    parentSignal: '15 parents used this as an Ask prompt',
    askPrompt: 'Emma woke after a short nap. What is one gentle next step?',
    safetyNote:
      'This story is a starting point for context, not a rule. Babio checks Emma’s latest rhythm first.',
  },
  {
    id: 'doctor-visit-question',
    topic: 'pediatrician',
    topicLabel: 'Pediatrician',
    ageRangeLabel: 'All ages',
    title: 'I want to ask clearly at the next visit.',
    summary: 'Parents often need a short pattern summary more than a long diary.',
    parentSignal: '9 parents copied a visit summary',
    askPrompt: 'Help me prepare a short pediatrician question from Emma’s recent notes.',
    safetyNote:
      'For urgent worries, use direct clinical help. Babio can help organize non-urgent notes.',
  },
]

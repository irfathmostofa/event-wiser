// Example content shown to users as inspiration when filling out an event.
// None of this is saved automatically — it's inserted only when the user
// asks for it, and only into fields that are still empty.

export const DEMO_CONTENT = {
  birthday: {
    label: "Birthday",
    countdown_eyebrow: "Finally that day has arrived",
    countdown_arrived: "Happy Birthday",
    section_eyebrow: "The moments worth remembering",
    envelope_letter_mark: "'My days would be incomplete without you — today, and forever.'",
    message:
      "Happy birthday! I wanted to put together something small to say how much you mean to me. " +
      "Every year with you gives me another reason to be grateful — for the late-night talks, the silly jokes only we laugh at, and the way you show up for the people you love. " +
      "I hope this next year brings you everything you're hoping for, and a few things you didn't even know to ask for. " +
      "Here's to celebrating you today, and every day after.",
    signature: "With love, always",
    closing_line: "Here's to another beautiful year ahead.",
  },
  anniversary: {
    label: "Anniversary",
    countdown_eyebrow: "Another year, more love",
    countdown_arrived: "Happy Anniversary",
    section_eyebrow: "Moments we built together",
    envelope_letter_mark: "'Every year with you feels like the best one yet.'",
    message:
      "Happy anniversary. Looking back at everything we've been through together, I keep landing on the same thought — I'd choose you again, every time. " +
      "Thank you for growing with me, for the patience on hard days, and for making even ordinary moments feel worth remembering. " +
      "I'm so glad this is the life we're building together.",
    signature: "Yours, today and always",
    closing_line: "Here's to many more years, together.",
  },
  fathers_day: {
    label: "Father's Day",
    countdown_eyebrow: "Today is all about you, Baba",
    countdown_arrived: "Happy Father's Day",
    section_eyebrow: "Memories with you",
    envelope_letter_mark: "'Thank you for everything you've given us, quietly and always.'",
    message:
      "Happy Father's Day. I don't say this enough, but I notice everything you've done for us — the quiet sacrifices, the advice I didn't always want to hear but needed, and the way you've always shown up. " +
      "You've taught me more than you probably realize, just by how you live. " +
      "Thank you for being exactly the father I needed.",
    signature: "With love and gratitude",
    closing_line: "I hope today feels as special as you are to us.",
  },
  mothers_day: {
    label: "Mother's Day",
    countdown_eyebrow: "Today is all about you, Maa",
    countdown_arrived: "Happy Mother's Day",
    section_eyebrow: "Memories with you",
    envelope_letter_mark: "'Everything good in me, I owe to you.'",
    message:
      "Happy Mother's Day. Whatever I've become, so much of it traces back to you — your patience, your strength, and the endless, quiet ways you've cared for us. " +
      "I don't think I can ever fully repay that, but I hope today, even a little, you feel how loved and appreciated you are.",
    signature: "With all my love",
    closing_line: "Thank you for being you, today and every day.",
  },
  valentines_day: {
    label: "Valentine's Day",
    countdown_eyebrow: "The day is finally here",
    countdown_arrived: "Happy Valentine's Day",
    section_eyebrow: "Little moments, big love",
    envelope_letter_mark: "'You're my favorite person, today and every day.'",
    message:
      "Happy Valentine's Day. I wanted to put into words what I usually just try to show — that being with you has made ordinary days feel a little more magical. " +
      "Thank you for your patience, your laugh, and for choosing me the way I choose you. " +
      "I can't wait for everything still ahead of us.",
    signature: "Forever yours",
    closing_line: "You're my favorite person, today and always.",
  },
  other: {
    label: "Other",
    countdown_eyebrow: "The day has finally arrived",
    countdown_arrived: "This Is Your Day",
    section_eyebrow: "Moments worth remembering",
    envelope_letter_mark: "'Today is all about celebrating you.'",
    message:
      "I wanted to take a moment to celebrate you today. Thinking back on everything we've shared, I keep coming back to how grateful I am to have you in my life. " +
      "I hope today reminds you how much you're appreciated.",
    signature: "With love",
    closing_line: "Here's to celebrating you.",
  },
};

export function getDemoContent(occasionType) {
  return DEMO_CONTENT[occasionType] ?? DEMO_CONTENT.other;
}

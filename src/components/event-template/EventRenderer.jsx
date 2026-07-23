import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { supabase } from "../../lib/supabase";
import useCountdown from "../../hooks/useCountdown";

import Ambience from "./Ambience";
import Envelope from "./Envelope";
import LockedTeaser from "./LockedTeaser";
import Countdown from "./Countdown";
import Timeline from "./Timeline";
import Gallery from "./Gallery";
import Letter from "./Letter";
import Closing from "./Closing";
import Divider from "./Divider";

export function publicUrl(path) {
  if (!path) return null;
  const { data } = supabase.storage.from("event-images").getPublicUrl(path);
  return data.publicUrl;
}

// event: row from `events`. timeline/gallery: rows from their tables.
export default function EventRenderer({ event, timeline, gallery }) {
  const [opened, setOpened] = useState(false);
  const target = event.target_date ?? new Date().toISOString();
  const time = useCountdown(target);

  const timelineEntries = timeline.map((t) => ({
    date: t.date_label,
    caption: t.caption,
    image: publicUrl(t.image_path),
  }));

  const galleryPhotos = gallery.map((g) => ({
    image: publicUrl(g.image_path),
    caption: g.caption,
  }));

  const ambiencePhotos = [...timeline, ...gallery]
    .map((item) => publicUrl(item.image_path))
    .filter(Boolean);
  const memoryCount = timeline.length + gallery.length;

  return (
    <>
      <Ambience photos={ambiencePhotos} />

      {!opened && (
        <Envelope
          name={event.recipient_name}
          opened={opened}
          onOpen={() => setOpened(true)}
          envelopeLetterMark={event.envelope_letter_mark}
          letterContent={event.message}
          signature={event.signature}
          closingLine={event.closing_line}
        />
      )}

      <AnimatePresence mode="wait">
        {opened && !time.arrived && (
          <motion.div
            key="locked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <LockedTeaser
              time={time}
              memoryCount={memoryCount}
              name={event.recipient_name}
              message={event.locked_message}
              footer={event.locked_footer}
              countdownEyebrow={event.countdown_eyebrow}
            />
          </motion.div>
        )}

        {opened && time.arrived && (
          <motion.div
            key="unlocked"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
          >
            <Countdown
              time={time}
              countdownEyebrow={event.countdown_eyebrow}
              countdownArrived={event.countdown_arrived}
            />
            <Divider />
            <Timeline
              entries={timelineEntries}
              sectionEyebrow={event.section_eyebrow}
            />
            <Divider />
            <Gallery photos={galleryPhotos} />
            <Divider />
            <Letter message={event.message} signature={event.signature} />
            <Closing line={event.closing_line} name={event.recipient_name} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

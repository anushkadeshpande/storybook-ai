'use client'
import React, { useState } from "react";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Button } from "./ui/button";

const StoryWriter = () => {
  const [story, setStory] = useState("");
  const [pages, setPages] = useState<number>();

  return (
    <div className="flex flex-col container">
      <section className="flex-1 flex flex-col border border-purple-300 rounded-md p-10 space-y-2">
        <Textarea
          value={story}
          onChange={e => setStory(e.target.value)}
          className="flex-1 text-black"
          placeholder="Write a story about ....."
        />

        <Select onValueChange={value => setPages(+value)}>
          <SelectTrigger>
            <SelectValue placeholder="How many pages should the story be?" />
          </SelectTrigger>

          <SelectContent>
            {Array.from({ length: 10 }, (_, i) => (
              <SelectItem key={i} value={String(i + 1)}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button disabled={!story || !pages}>Generate Story 🚀</Button>
      </section>
    </div>
  );
};

export default StoryWriter;

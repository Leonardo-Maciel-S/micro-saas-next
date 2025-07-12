"use client";

import { ChangeEvent, useState, useRef } from "react";
import { debounce } from "lodash";
import { toast } from "sonner";
import { changeDescription } from "../_actions/change-bio";

export default function Description({
  initialDescription,
}: {
  initialDescription: string;
}) {
  const [description, setDescription] = useState(initialDescription);
  const [originalDescription] = useState(initialDescription);

  const debouncedSaveDescription = useRef(
    debounce(async (currentDescription: string) => {
      if (currentDescription.trim() === "") {
        setDescription(originalDescription);
        return;
      }

      if (currentDescription !== description) {
        try {
          const response = await changeDescription({
            description: currentDescription,
          });

          if (response.error) {
            toast.success(response.error);

            setDescription(originalDescription);
            return;
          }

          toast.success("Descrição alterada com sucesso!");
        } catch (error) {
          console.log(error);
          setDescription(originalDescription);
        }
      }
    }, 500)
  ).current;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(event.target.value);

    debouncedSaveDescription(event.target.value);
  };

  return (
    <div>
      <textarea
        className="text-base bg-gray-50 border border-gray-100 rounded-md outline-none p-2 w-full max-w-2xl my-3 h-40 resize-none"
        value={description}
        onChange={handleChange}
      />
    </div>
  );
}

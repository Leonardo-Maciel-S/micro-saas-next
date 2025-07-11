"use client";

import { ChangeEvent, useState, useRef } from "react";
import { debounce } from "lodash";
import { changeName } from "../_actions/change-name";
import { toast } from "sonner";

export default function Name({ initialName }: { initialName: string }) {
  const [name, setName] = useState(initialName);
  const [originalName, setOriginalName] = useState(initialName);

  const debouncedSaveName = useRef(
    debounce(async (currentName: string) => {
      if (currentName.trim() === "") {
        setName(originalName);
        return;
      }

      if (currentName !== name) {
        try {
          const response = await changeName({
            name: currentName,
          });

          if (response.error) {
            toast.success(response.error);

            setName(originalName);
            return;
          }

          toast.success("Nome alterado com sucesso!");
        } catch (error) {
          console.log(error);
          setName(originalName);
        }
      }
    }, 500)
  ).current;

  const handleChangeName = (event: ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);

    debouncedSaveName(event.target.value);
  };

  return (
    <div>
      <input
        className="text-xl md:text-2xl font-bold bg-gray-50 border border-gray-100 rounded-md outline-none p-2 w-full max-w-2xl text-center my-3"
        value={name}
        onChange={handleChangeName}
      />
    </div>
  );
}

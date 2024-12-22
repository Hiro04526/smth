import { ModalityEnumSchema } from "@/lib/enums";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { FormSelectField } from "./form/form-select-field";
import { FormTextField } from "./form/form-text-field";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { ScrollArea } from "./ui/scroll-area";
import { Toggle } from "./ui/toggle";

const classFormSchema = z.object({
  code: z.coerce.number().default(0),
  course: z.string(),
  section: z.string(),
  professor: z.string(),
  schedules: z
    .array(
      z
        .object({
          day: z.enum(["M", "T", "W", "H", "F", "S", "U"]),
          start: z.coerce
            .number({ message: "Invalid Input" })
            .min(700, "Lowest is 700.")
            .max(2400, "Highest is 2400."),
          end: z.coerce
            .number({ message: "Invalid Input" })
            .min(700, "Lowest is 700.")
            .max(2400, "Highest is 2400."),
          date: z.string(),
          isOnline: z.boolean(),
        })
        .refine((schema) => schema.start < schema.end, {
          message: "Start can't be greater than or equal to end time.",
          path: ["start"],
        })
    )
    .min(1),
  enrolled: z.number().default(0),
  enrollCap: z.number().default(0),
  rooms: z.array(z.string()).min(1),
  restriction: z.string(),
  modality: ModalityEnumSchema,
  remarks: z.string(),
});

interface AddCustomClassProps {
  courseCode: string;
}

export default function AddCustomClass({ courseCode }: AddCustomClassProps) {
  const [open, setOpen] = useState(false);
  const addClassToCourse = useGlobalStore((state) => state.addClassToCourse);

  const form = useForm<z.infer<typeof classFormSchema>>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      code: 123,
      course: courseCode,
      section: "",
      professor: "",
      schedules: [
        {
          day: "M",
          start: undefined,
          end: undefined,
          date: "",
          isOnline: false,
        },
      ],
      enrolled: 0,
      enrollCap: 0,
      rooms: [""],
      restriction: "",
      modality: "HYBRID",
      remarks: "",
    },
  });

  const schedules = useFieldArray({
    control: form.control,
    name: "schedules",
  });

  const onSubmit = (values: z.infer<typeof classFormSchema>) => {
    addClassToCourse(courseCode, values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="size-4 mr-2" />
          Add Class
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[600px] max-h-[80%] flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Custom Class</DialogTitle>
          <DialogDescription>
            {"For classes/schedules that aren't found in MLS."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            className="flex flex-col gap-4 min-h-0"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <div className="grid grid-cols-3 gap-4">
              <FormTextField
                form={form}
                label="Code"
                formKey="code"
                placeholder="1234"
                divClassName="w-full"
              />
              <FormTextField
                form={form}
                label="Section"
                formKey="section"
                placeholder="Z32"
                divClassName="w-full"
              />
              <FormTextField
                form={form}
                label="Room"
                formKey="rooms.0"
                placeholder="AG1109"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormTextField
                form={form}
                label="Professor"
                formKey="professor"
                placeholder="Dela Cruz, Juan"
              />
              <FormSelectField
                form={form}
                label="Modality"
                formKey="modality"
                options={[
                  { label: "Hybrid", value: "HYBRID" },
                  { label: "Face-to-Face", value: "F2F" },
                  { label: "Online", value: "ONLINE" },
                  {
                    label: "Predominantly Online",
                    value: "PREDOMINANTLY ONLINE",
                  },
                  { label: "Tentative", value: "TENTATIVE" },
                ]}
              />
            </div>
            <FormTextField
              form={form}
              label="Remarks"
              formKey="remarks"
              placeholder="This is a custom class."
            />
            <h3 className="text-sm font-semibold">Schedules</h3>
            <ScrollArea className="h-48">
              <div className="flex flex-col gap-4 min-h-0">
                {schedules.fields.map((field, i) => (
                  <div
                    key={field.id}
                    className="flex flex-row gap-4 items-start"
                  >
                    <FormSelectField
                      form={form}
                      formKey={`schedules.${i}.day`}
                      options={[
                        { label: "M", value: "M" },
                        { label: "T", value: "T" },
                        { label: "W", value: "W" },
                        { label: "H", value: "H" },
                        { label: "F", value: "F" },
                        { label: "S", value: "S" },
                        { label: "U", value: "U" },
                      ]}
                      className="w-32"
                    />
                    <div className="inline-flex gap-2 items-start">
                      <FormTextField
                        form={form}
                        formKey={`schedules.${i}.start`}
                        placeholder="Start"
                      />
                      <FormTextField
                        form={form}
                        formKey={`schedules.${i}.end`}
                        placeholder="End"
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name={`schedules.${i}.isOnline`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Toggle
                              variant="outline"
                              pressed={field.value}
                              onPressedChange={field.onChange}
                            >
                              <Check
                                className={`size-4 mr-2 ${
                                  field.value ? "visible" : "opacity-10"
                                }`}
                              />
                              Online?
                            </Toggle>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="shrink-0"
                      type="button"
                      onClick={() => schedules.remove(i)}
                      disabled={form.watch("schedules").length === 1}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
                {form.watch("schedules").length < 5 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() =>
                      schedules.append({
                        day: "M",
                        start: 730,
                        end: 900,
                        date: "",
                        isOnline: false,
                      })
                    }
                  >
                    <Plus className="size-4 mr-2" />
                    Add Schedule
                  </Button>
                )}
              </div>
            </ScrollArea>
            <DialogFooter>
              <Button type="submit" size="sm">
                Add Class
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

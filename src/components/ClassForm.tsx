import { Class } from "@/lib/definitions";
import { ModalityEnumSchema } from "@/lib/enums";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, CheckCheck, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { FormSelectField } from "./form/form-select-field";
import { FormTextField } from "./form/form-text-field";
import { Button } from "./ui/button";
import { DialogFooter } from "./ui/dialog";
import { Form, FormControl, FormField, FormItem } from "./ui/form";
import { ScrollArea } from "./ui/scroll-area";
import { Toggle } from "./ui/toggle";

interface ClassFormProps {
  onSubmit: (data: Class) => void;
  defaultValues?: Class;
  courseCode: string;
}
export default function ClassForm({
  onSubmit,
  courseCode,
  defaultValues,
}: ClassFormProps) {
  const courses = useGlobalStore((state) => state.courses);

  const classFormSchema = z.object({
    code: z.coerce
      .number()
      .default(0)
      .refine(
        (val) => {
          console.log(val, defaultValues?.code);

          return (
            !courses
              .find((c) => c.courseCode === courseCode)
              ?.classes.some((classData) => classData.code === val) ||
            defaultValues?.code === val
          );
        },
        {
          message: "Class code already exists.",
        }
      ),
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

  const form = useForm<z.infer<typeof classFormSchema>>({
    resolver: zodResolver(classFormSchema),
    defaultValues: defaultValues ?? {
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

  const handleAppendSchedule = () => {
    schedules.append({
      day: "M",
      start: 730,
      end: 900,
      date: "",
      isOnline: false,
    });

    form.setValue("rooms", [...form.getValues("rooms"), ""]);
  };

  const handleDeleteSchedule = (index: number) => {
    schedules.remove(index);
    form.setValue(
      "rooms",
      form.getValues("rooms").filter((_, i) => i !== index)
    );
  };

  return (
    <Form {...form}>
      <form
        className="flex flex-col gap-4 min-h-0"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="grid grid-cols-2 gap-4">
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
              <div key={field.id} className="flex flex-row gap-4 items-start">
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
                <FormTextField
                  form={form}
                  formKey={`rooms.${i}`}
                  placeholder="AG1109"
                  className="w-32"
                />
                <Button
                  size="icon"
                  variant="outline"
                  className="shrink-0"
                  type="button"
                  onClick={() => handleDeleteSchedule(i)}
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
                onClick={() => handleAppendSchedule()}
              >
                <Plus className="size-4 mr-2" />
                Add Schedule
              </Button>
            )}
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button type="submit" size="sm">
            <CheckCheck className="size-4 mr-2" />
            Submit
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

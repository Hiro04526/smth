"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { fetchCourse } from "@/lib/actions";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ChevronDown,
  IdCard,
  Import,
  ListPlus,
  LoaderCircle,
  SquarePen,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import { useShallow } from "zustand/react/shallow";
import Dropdown, { DropdownItems } from "./common/Dropdown";
import IDInput from "./IDInput";

const formSchema = z.object({
  courseCode: z.string().length(7, "Length should be 7!"),
});

const CourseInput = () => {
  const { id, addCourse, courses } = useGlobalStore(
    useShallow((state) => ({
      id: state.id,
      addCourse: state.addCourse,
      courses: state.courses,
    }))
  );
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseCode: "",
    },
  });

  const handleFetch = async (courseCode: string) => {
    if (!id) {
      toast.error("You haven't set your ID number yet.", {
        description: "Set your ID on the button at the top right corner.",
      });

      return;
    }

    if (courses.some((course) => course.courseCode === courseCode)) {
      toast.error("Duplicate Course Code Detected", {
        description:
          "You've already added that course. To update it, click the course list settings button.",
      });

      return;
    }

    try {
      const { data } = await fetchCourse(courseCode, id);

      if (!data) {
        toast.error("Something went wrong while fetching...", {
          description:
            "The server is facing some issues right now, try again in a bit.",
        });

        return;
      }

      if (data.classes.length === 0) {
        toast.error("Something went wrong while fetching...", {
          description:
            "No classes were found for that course. Either MLS is down or no classes exist yet for that course.",
        });

        return;
      }

      toast.success(`Course ${courseCode} added successfully!`);
      addCourse(data);
    } catch (error) {
      toast.warning("Slow down!", {
        description:
          "You're doing too many requests too quickly. Please wait a bit before adding more. This is to prevent spamming the server.",
      });
    }
  };

  const addMLSCourse = async (values: z.infer<typeof formSchema>) => {
    setIsFetching(true);

    try {
      await handleFetch(values.courseCode.toUpperCase());
    } catch (error) {
      toast.error("Something went wrong while fetching...", {
        description:
          "The server is facing some issues right now, try again in a bit.",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const addCustomCourse = (values: z.infer<typeof formSchema>) => {
    if (courses.some((course) => course.courseCode === values.courseCode)) {
      toast.error("Duplicate Course Code Detected", {
        description:
          "You've already added that course. To update it, click the course settings button.",
      });

      return;
    }

    addCourse({
      courseCode: values.courseCode,
      classes: [],
      lastFetched: new Date(),
      isCustom: true,
    });
  };

  const dropdownItems: DropdownItems[] = [
    {
      name: "Add from MLS",
      Icon: Import,
      onClick: () => form.handleSubmit(addMLSCourse)(),
    },
    {
      name: "Add as Custom Course",
      onClick: () => form.handleSubmit(addCustomCourse)(),
      Icon: SquarePen,
    },
  ];

  if (!id) {
    return (
      <IDInput>
        <Button
          variant="outline"
          className="w-full border-primary animate-pulse inline-flex items-center"
        >
          <IdCard className="size-4 mr-2" /> Set ID Number
        </Button>
      </IDInput>
    );
  }

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(addMLSCourse)}
        className="space-y-4"
      >
        <FormField
          control={form.control}
          name="courseCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course Code</FormLabel>
              <FormControl>
                <Input placeholder="GE12345" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Dropdown items={dropdownItems} className="dropdown-content-width-full">
          <Button
            size="sm"
            variant="default"
            className="w-full"
            disabled={isFetching}
          >
            {isFetching ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <>
                <ListPlus className="size-4 mr-2" />
                Add Course
                <ChevronDown className="size-4 ml-2" />
              </>
            )}
          </Button>
        </Dropdown>
      </form>
    </Form>
  );
};

export default CourseInput;

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
import { Course } from "@/lib/definitions";
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
import * as z from "zod";
import { useShallow } from "zustand/react/shallow";
import Dropdown, { DropdownItems } from "./common/Dropdown";
import IDInput from "./IDInput";
import { toast } from "./ui/use-toast";

const formSchema = z.object({
  courseCode: z.string().length(7, "Length should be 7!"),
});

type CourseInputprops = {
  courses: Course[];
  setCourses: (courses: Course[]) => void;
};

const CourseInput = ({ courses, setCourses }: CourseInputprops) => {
  const { id, setId, addCourse } = useGlobalStore(
    useShallow((state) => ({
      id: state.id,
      setId: state.setId,
      addCourse: state.addCourse,
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
      toast({
        title: "You haven't set your ID yet!",
        description: "Set your ID on the button at the top right corner.",
        variant: "destructive",
      });

      return;
    }

    if (courses.some((course) => course.courseCode === courseCode)) {
      toast({
        title: "Duplicate Course Code!",
        description:
          "You've already added that course. To update it, click the course settings button.",
        variant: "destructive",
      });

      return;
    }

    try {
      const { data } = await fetchCourse(courseCode, id);

      if (!data) {
        toast({
          title: "Something went wrong while fetching...",
          description:
            "The server is facing some issues right now, try again in a bit.",
          variant: "destructive",
        });

        return;
      }

      if (data.classes.length === 0) {
        toast({
          title: "Oops... That course doesn't have any classes.",
          description:
            "Either that course doesn't exist or no classes have been published yet.",
          variant: "destructive",
        });

        return;
      }

      addCourse(data);
    } catch (error) {
      toast({
        title: "Slow down!",
        description:
          "You're doing too many requests too quickly. Wait a bit before adding more.",
        variant: "destructive",
      });
    }
  };

  const addMLSCourse = async (values: z.infer<typeof formSchema>) => {
    setIsFetching(true);

    try {
      await handleFetch(values.courseCode.toUpperCase());
    } catch (error) {
      toast({
        title: "Something went wrong while fetching...",
        description:
          "The server is facing some issues right now, try again in a bit.",
        variant: "destructive",
      });
    } finally {
      setIsFetching(false);
    }
  };

  const addCustomCourse = (values: z.infer<typeof formSchema>) => {
    if (courses.some((course) => course.courseCode === values.courseCode)) {
      toast({
        title: "Duplicate Course Code!",
        description:
          "You've already added that course. To update it, click the course settings button.",
        variant: "destructive",
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

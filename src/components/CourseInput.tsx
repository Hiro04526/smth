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
import { fetchMultipleCourses } from "@/lib/actions";
import { Course } from "@/lib/definitions";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useShallow } from "zustand/react/shallow";
import { toast } from "./ui/use-toast";

const formSchema = z.object({
  courseCode: z.string().length(7, "Length should be 7!"),
});

type props = {
  fetchHandler: (courseCode: string) => Promise<void>;
  courses: Course[];
  setCourses: (courses: Course[]) => void;
};

const CourseInput = ({ fetchHandler, courses, setCourses }: props) => {
  const { id, setId } = useGlobalStore(
    useShallow((state) => ({ id: state.id, setId: state.setId }))
  );
  const [isFetching, setIsFetching] = useState<boolean>(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      courseCode: "",
    },
  });

  const handleUpdate = async () => {
    if (!id) {
      toast({
        title: "You haven't set your ID yet!",
        description: "Set your ID on the button at the top right corner.",
        variant: "destructive",
      });

      return;
    }

    if (id.includes('"')) {
      setId(id.replaceAll('"', ""));
    }

    setIsFetching(true);
    try {
      const newData = await fetchMultipleCourses(
        courses.map((course) => course.courseCode),
        id
      );

      setCourses(newData);
      toast({
        title: "Successfully updated all courses!",
        description: "The courses should now display updated data.",
      });
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

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsFetching(true);

    try {
      await fetchHandler(values.courseCode.toUpperCase());
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

  return (
    <Form {...form}>
      <form
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
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
        <Button className="w-full" type="submit" disabled={isFetching}>
          {isFetching ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            "Add Course"
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => handleUpdate()}
          disabled={isFetching}
        >
          {isFetching ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            "Update All Courses"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default CourseInput;

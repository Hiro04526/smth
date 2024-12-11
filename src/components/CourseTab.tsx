"use client";

import { fetchCourse } from "@/lib/actions";
import { Course } from "@/lib/definitions";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { Reorder, useDragControls } from "framer-motion";
import { CircleOff, GripVertical, MousePointerClick } from "lucide-react";
import { useCallback, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import CourseInput from "./CourseInput";
import { columns } from "./courseTable/columns";
import { DataTable } from "./courseTable/data-table";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { toast } from "./ui/use-toast";

const CourseTab = () => {
  const { id, courses, setCourses, removeCourse, addCourse } = useGlobalStore(
    useShallow((state) => ({
      courses: state.courses,
      setCourses: state.setCourses,
      id: state.id,
      removeCourse: state.removeCourse,
      addCourse: state.addCourse,
    }))
  );

  const [activeCourse, setActiveCourse] = useState<number>(0);
  const controls = useDragControls();

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
        title: "That's not possible...",
        description: "You already added that course!",
        variant: "destructive",
      });

      return;
    }

    const data = await fetchCourse(courseCode, id);

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
  };

  const handleDelete = (courseCode: string) => {
    if (courses[activeCourse].courseCode === courseCode) {
      setActiveCourse(0);
    }

    removeCourse(courseCode);
  };

  const handleSwap = useCallback(
    (newCourses: Course[]) => {
      setCourses(newCourses);
    },
    [setCourses]
  );

  return (
    <div className="flex gap-4 flex-row flex-grow py-8 px-16 w-full self-stretch min-h-0">
      <div className="flex flex-col gap-4 min-w-64 max-w-64">
        <Card>
          <CardContent className="pt-6">
            <CourseInput
              fetchHandler={handleFetch}
              courses={courses}
              setCourses={setCourses}
            />
          </CardContent>
        </Card>
        <Card className="flex flex-col grow">
          <CardHeader>
            <CardTitle>Course Codes</CardTitle>
          </CardHeader>
          <CardContent className="grow">
            {courses.length !== 0 ? (
              <Reorder.Group
                className="flex gap-2 row flex-col"
                axis="y"
                values={courses}
                onReorder={handleSwap}
              >
                {courses.map((course, i) => (
                  <Reorder.Item
                    key={course.courseCode}
                    value={course}
                    className="flex flex-row gap-2 items-center"
                  >
                    <GripVertical
                      onPointerDown={(e) => controls.start(e)}
                      className="shrink-0 text-muted-foreground cursor-grab"
                    />
                    <Button
                      variant={
                        courses[activeCourse]?.courseCode === course.courseCode
                          ? "default"
                          : "outline"
                      }
                      onClick={() => setActiveCourse(i)}
                      className="w-full"
                    >
                      {course.courseCode}
                    </Button>
                    <Button
                      size="icon"
                      className="shrink-0 hover:border-rose-700"
                      variant="outline"
                      onClick={() => handleDelete(course.courseCode)}
                    >
                      X
                    </Button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            ) : (
              <div className="text-sm text-muted-foreground size-full flex flex-col gap-2 items-center justify-center">
                <CircleOff />
                None added yet.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {!!courses.length ? (
        <DataTable
          columns={columns}
          data={courses[activeCourse].classes}
          lastFetched={courses[activeCourse].lastFetched}
          activeCourse={courses[activeCourse].courseCode}
        />
      ) : (
        <Card className="flex flex-row items-center justify-center gap-6 text-muted-foreground p-6 grow">
          <MousePointerClick strokeWidth={1} size={80} />
          <span className="flex flex-col gap-1">
            <span className="font-bold text-xl">No courses yet...</span>
            <span className="w-80">{`Add courses on the left. Don't forget to set your ID at the top right too!`}</span>
          </span>
        </Card>
      )}
    </div>
  );
};

export default CourseTab;

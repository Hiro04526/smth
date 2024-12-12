import { Course } from "@/lib/definitions";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { Reorder, useDragControls } from "framer-motion";
import { CircleOff, GripVertical } from "lucide-react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

interface CourseListProps {
  activeCourse: number;
  setActiveCourse: (index: number) => void;
}
export default function CourseList({
  activeCourse,
  setActiveCourse,
}: CourseListProps) {
  const { courses, setCourses, removeCourse } = useGlobalStore(
    useShallow((state) => ({
      courses: state.courses,
      setCourses: state.setCourses,
      removeCourse: state.removeCourse,
    }))
  );

  const controls = useDragControls();

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
    <Card className="flex flex-col grow">
      <CardHeader>
        <CardTitle>Course List</CardTitle>
      </CardHeader>
      <CardContent className="grow">
        {courses.length !== 0 ?
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
                    courses[activeCourse]?.courseCode === course.courseCode ?
                      "default"
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
        : <div className="text-sm text-muted-foreground size-full flex flex-col gap-2 items-center justify-center">
            <CircleOff />
            None added yet.
          </div>
        }
      </CardContent>
    </Card>
  );
}

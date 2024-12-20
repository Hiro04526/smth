import { Course } from "@/lib/definitions";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { Reorder, useDragControls } from "framer-motion";
import { CircleOff, GripVertical, Group, ListX, X } from "lucide-react";
import { useCallback } from "react";
import { useShallow } from "zustand/react/shallow";
import TooltipButton from "./common/TooltipButton";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

interface CourseItemProps {
  course: Course;
  index: number;
  activeCourse: number;
  setActiveCourse: (index: number) => void;
}

function CourseItem({
  course,
  index,
  activeCourse,
  setActiveCourse,
}: CourseItemProps) {
  const {
    courses,
    setCourses,
    removeCourse,
    selectedRows,
    removeAllSelectedRows,
  } = useGlobalStore(
    useShallow((state) => ({
      courses: state.courses,
      setCourses: state.setCourses,
      removeCourse: state.removeCourse,
      selectedRows: state.selectedRows,
      removeAllSelectedRows: state.removeAllSelectedRows,
    }))
  );

  const handleDelete = (courseCode: string) => {
    if (activeCourse >= 0 && courses[activeCourse].courseCode === courseCode) {
      setActiveCourse(0);
    }

    removeCourse(courseCode);
  };

  const controls = useDragControls();

  return (
    <Reorder.Item
      key={course.courseCode}
      value={course}
      className="flex flex-row gap-2 items-center"
      dragControls={controls}
      dragListener={false}
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
        onClick={() => setActiveCourse(index)}
        className="w-full justify-between"
      >
        {course.courseCode}{" "}
        {selectedRows[course.courseCode] && (
          <Badge
            variant="secondary"
            className="rounded-sm font-bold p-1 size-5 justify-center font-mono"
          >
            {Object.keys(selectedRows[course.courseCode]).length}
          </Badge>
        )}
      </Button>
      <Button
        size="icon"
        className="shrink-0 group hover:bg-destructive/80"
        variant="outline"
        onClick={() => handleDelete(course.courseCode)}
      >
        <X className="size-4 group-hover:text-destructive-foreground" />
      </Button>
    </Reorder.Item>
  );
}

interface CourseListProps {
  activeCourse: number;
  setActiveCourse: (index: number) => void;
}
export default function CourseList({
  activeCourse,
  setActiveCourse,
}: CourseListProps) {
  const { courses, setCourses, selectedRows, removeAllSelectedRows } =
    useGlobalStore(
      useShallow((state) => ({
        courses: state.courses,
        setCourses: state.setCourses,
        removeCourse: state.removeCourse,
        selectedRows: state.selectedRows,
        removeAllSelectedRows: state.removeAllSelectedRows,
      }))
    );

  const handleSwap = useCallback(
    (newCourses: Course[]) => {
      setCourses(newCourses);
    },
    [setCourses]
  );

  return (
    <Card className="flex flex-col grow shrink min-h-0">
      <CardHeader className="pb-4 flex flex-row items-center justify-between space-y-0">
        <CardTitle>Course List</CardTitle>
        <TooltipButton
          tooltip="Clear Selected Rows"
          variant="outline"
          size="icon"
          disabled={!Object.keys(selectedRows).length}
          onClick={removeAllSelectedRows}
        >
          <ListX />
        </TooltipButton>
      </CardHeader>
      <ScrollArea className="min-h-0">
        <CardContent className="">
          <Button
            className="w-full mb-2"
            variant={activeCourse === -1 ? "default" : "outline"}
            onClick={() => setActiveCourse(-1)}
          >
            <Group className="size-4 mr-2" /> Group Courses
          </Button>
          {courses.length !== 0 ? (
            <Reorder.Group
              className="flex gap-2 row flex-col"
              axis="y"
              values={courses}
              onReorder={handleSwap}
            >
              {courses.map((course, i) => (
                <CourseItem
                  key={course.courseCode}
                  activeCourse={activeCourse}
                  course={course}
                  index={i}
                  setActiveCourse={setActiveCourse}
                />
              ))}
            </Reorder.Group>
          ) : (
            <div className="text-sm text-muted-foreground size-full flex flex-col gap-2 items-center justify-center">
              <CircleOff />
              None added yet.
            </div>
          )}
        </CardContent>
      </ScrollArea>
    </Card>
  );
}

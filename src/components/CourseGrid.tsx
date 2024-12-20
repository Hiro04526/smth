import { Course } from "@/lib/definitions";
import { useGlobalStore } from "@/stores/useGlobalStore";
import {
  DndContext,
  DragEndEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  Ellipsis,
  MousePointerClick,
  Plus,
  SquareMousePointer,
  X,
} from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { Badge } from "./ui/badge";
import { Button, buttonVariants } from "./ui/button";
import { Card } from "./ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { toast } from "./ui/use-toast";

interface CourseGridProps {}

interface CourseGroupProps {
  groupName: string;
  courses: Course[];
  removeCourseGroup: (groupName: string) => void;
  moveCourseToGroup: (groupName: string, courseCode: string) => void;
  removeCourse: (courseCode: string) => void;
  pick: number;
  noOptions?: boolean;
}

function CourseItem({
  course,
  removeCourse,
}: {
  course: Course;
  removeCourse: (courseCode: string) => void;
}) {
  const { setNodeRef, attributes, listeners, transform } = useDraggable({
    id: course.courseCode,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={buttonVariants({
        variant: "outline",
        className: "cursor-grab justify-between",
      })}
      style={style}
    >
      <span>{course.courseCode}</span>
      <span
        className="size-6 rounded-lg cursor-pointer flex items-center justify-center opacity-40 hover:opacity-100 group hover:bg-destructive hover:text-destructive-foreground transition-colors"
        onMouseUp={() => {
          removeCourse(course.courseCode);
        }}
      >
        <X className="size-3" strokeWidth={3} />
      </span>
    </div>
  );
}

function CourseGroupColumn({
  groupName,
  pick,
  courses,
  removeCourse,
  removeCourseGroup,
  noOptions = false,
}: CourseGroupProps) {
  const { setNodeRef } = useDroppable({
    id: groupName,
  });

  return (
    <Card className="flex flex-col gap-4 p-4 w-full">
      <div className="flex justify-between items-center w-full">
        <h3 className="text-lg font-semibold">{groupName}</h3>
        {!noOptions && (
          <div className="inline-flex gap-2">
            <Badge variant="outline">{pick}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="outline">
                  <Ellipsis className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Group Options</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Rename</DropdownMenuItem>
                <DropdownMenuItem>Change Picks</DropdownMenuItem>
                <DropdownMenuItem onClick={() => removeCourseGroup(groupName)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 grow" ref={setNodeRef}>
        {courses.length ? (
          courses.map((course) => (
            <CourseItem
              key={course.courseCode}
              course={course}
              removeCourse={removeCourse}
            />
          ))
        ) : (
          <div className="border border-border border-dashed p-4 rounded-lg text-muted-foreground flex flex-col gap-2 items-center justify-center grow">
            <SquareMousePointer className="size-8" />{" "}
            <span>Drag & Drop Courses here</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function CourseGrid({}: CourseGridProps) {
  const { courseGroups, courses, addCourseGroup, ...groupFunctions } =
    useGlobalStore(
      useShallow((state) => ({
        courseGroups: state.courseGroups,
        courses: state.courses,
        removeCourseGroup: state.removeCourseGroup,
        moveCourseToGroup: state.moveCourseToGroup,
        removeCourse: state.removeCourse,
        addCourseGroup: state.addCourseGroup,
        renameCourseGroup: state.renameCourseGroup,
      }))
    );

  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (!over) return;

    const courseName = active.id;
    const newGroupName = over.id;
  };

  const handleCreateGroup = () => {
    const newGroup = newGroupName.trim();

    if (Object.hasOwn(courseGroups, newGroup)) {
      toast({
        title: "Group already exists!",
        description: "Please choose a different name.",
        variant: "destructive",
      });

      return;
    }

    addCourseGroup(newGroup);
    setIsCreating(false);
    setNewGroupName("");
  };

  if (!courses.length) {
    return (
      <Card className="flex flex-row items-center justify-center gap-6 text-muted-foreground p-6 grow">
        <MousePointerClick strokeWidth={1} size={80} />
        <span className="flex flex-col gap-1">
          <span className="font-bold text-xl">No courses yet...</span>
          <span className="w-80">{`Add courses on the left. Don't forget to set your ID at the top right too!`}</span>
        </span>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-col gap-2">
        <h2 className="font-bold text-2xl">Group Courses</h2>
        <p className="text-muted-foreground">
          Create groups and choose how many to pick from each group! Drag and
          drop to move courses.
        </p>
      </div>
      <div className="grid grid-cols-4 gap-4 w-full">
        <DndContext onDragEnd={handleDragEnd}>
          <CourseGroupColumn
            groupName="Ungrouped"
            pick={-1}
            courses={courses}
            {...groupFunctions}
            noOptions
          />
          {Object.entries(courseGroups).map(([groupName, pick]) => (
            <CourseGroupColumn
              key={groupName}
              groupName={groupName}
              pick={pick}
              courses={courses.filter((course) => course.group === groupName)}
              {...groupFunctions}
            />
          ))}
        </DndContext>
        {isCreating ? (
          <div className="border-border border p-4 h-max flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Group Name"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
            />
            <div className="justify-end flex gap-2">
              <Button
                onClick={() => setIsCreating(false)}
                variant="outline"
                size="sm"
              >
                Cancel
              </Button>
              <Button onClick={handleCreateGroup} size="sm">
                <Plus className="size-4 mr-2" /> Create
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => {
              setIsCreating(true);
            }}
            variant="ghost"
          >
            <Plus className="size-4 mr-2" />
            Add Group
          </Button>
        )}
      </div>
    </div>
  );
}

import { Course } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import { useGlobalStore } from "@/stores/useGlobalStore";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import {
  Check,
  MousePointerClick,
  Plus,
  SquareMousePointer,
  X,
} from "lucide-react";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import Dropdown from "./common/Dropdown";
import TooltipWrapper from "./common/TooltipWrapper";
import { Badge } from "./ui/badge";
import { Button, buttonVariants } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { toast } from "./ui/use-toast";

interface CourseItemProps {
  course: Course;
  removeCourse: (courseCode: string) => void;
}

function CourseItem({ course, removeCourse }: CourseItemProps) {
  const { setNodeRef, attributes, listeners, isDragging } = useDraggable({
    id: course.courseCode,
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={buttonVariants({
        variant: "outline",
        className: cn(
          "cursor-grab justify-between",
          isDragging && "opacity-30"
        ),
      })}
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

interface CourseGroupColumnProps {
  groupName: string;
  courses: Course[];
  removeCourseGroup: (groupName: string) => void;
  removeCourse: (courseCode: string) => void;
  renameCourseGroup: (groupName: string, newGroupName: string) => void;
  setGroupPick: (groupName: string, pick: number) => void;
  pick: number;
  noOptions?: boolean;
}

function CourseGroupColumn({
  groupName,
  pick,
  courses,
  removeCourse,
  removeCourseGroup,
  renameCourseGroup,
  setGroupPick,
  noOptions = false,
}: CourseGroupColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: groupName,
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingPick, setIsEditingPick] = useState(false);
  const [input, setInput] = useState(groupName);

  const dropdownOptions = [
    {
      name: "Rename",
      onClick: () => {
        setInput(groupName);
        setIsEditingTitle(true);
      },
    },
    {
      name: "Change Picks",
      onClick: () => {
        setInput(pick.toString());
        setIsEditingPick(true);
      },
    },
    { name: "Delete", onClick: () => removeCourseGroup(groupName) },
  ];

  const handleTitleEdit = () => {
    const newTitleFormatted = input.trim();

    if (!newTitleFormatted) {
      toast({
        title: "Group name cannot be empty!",
        description: "Please enter a valid group name.",
        variant: "destructive",
      });
      return;
    }

    if (groupName !== newTitleFormatted) {
      renameCourseGroup(groupName, newTitleFormatted);
    }

    setIsEditingTitle(false);
  };

  const handlePickEdit = () => {
    const newPick = parseInt(input);

    if (isNaN(newPick) || newPick < 0) {
      toast({
        title: "Invalid number of courses!",
        description: "Please enter a valid number.",
        variant: "destructive",
      });
      return;
    }

    setGroupPick(groupName, newPick);
    setIsEditingPick(false);
  };

  return (
    <Card
      className={`flex flex-col gap-4 p-4 w-full min-h-[300px] ${
        isOver ? "animate-border-pulse border-primary" : ""
      }`}
      ref={setNodeRef}
    >
      <div className="flex justify-between items-center w-full">
        {isEditingTitle ? (
          <div className="inline-flex gap-2 w-full">
            <Input
              placeholder="Group Name"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button
              onClick={handleTitleEdit}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <Check className="size-4" />
            </Button>
          </div>
        ) : (
          <h3 className="text-xl font-semibold truncate">{groupName}</h3>
        )}
        {!noOptions && !isEditingTitle && !isEditingPick && (
          <div className="inline-flex gap-2">
            <TooltipWrapper content="# of courses to pick.">
              <Badge variant="secondary" className="size-8 justify-center">
                {pick}
              </Badge>
            </TooltipWrapper>
            {!noOptions && <Dropdown items={dropdownOptions} title="Options" />}
          </div>
        )}
        {isEditingPick && (
          <div className="inline-flex gap-2 w-40">
            <Input
              type="text"
              placeholder="# of courses to pick"
              value={input}
              onChange={(e) => {
                const re = /^[0-9\b]+$/;
                if (e.target.value === "" || re.test(e.target.value))
                  setInput(e.target.value);
              }}
              pattern="\d*"
            />
            <Button
              onClick={handlePickEdit}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <Check className="size-4" />
            </Button>
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2 grow">
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
            <SquareMousePointer className="size-8" strokeWidth={2} />
            <span className="text-balance text-center">
              Drag & Drop Courses here
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}

interface CourseGridProps {}

export default function CourseGrid({}: CourseGridProps) {
  const {
    courseGroups,
    courses,
    addCourseGroup,
    moveCourseToGroup,
    ...groupFunctions
  } = useGlobalStore(
    useShallow((state) => ({
      courseGroups: state.courseGroups,
      courses: state.courses,
      removeCourseGroup: state.removeCourseGroup,
      moveCourseToGroup: state.moveCourseToGroup,
      removeCourse: state.removeCourse,
      addCourseGroup: state.addCourseGroup,
      renameCourseGroup: state.renameCourseGroup,
      setGroupPick: state.setGroupPick,
    }))
  );

  const [isCreating, setIsCreating] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;

    if (!over) return;

    const courseName = active.id as string;
    const newGroupName = over.id as string;

    moveCourseToGroup(newGroupName, courseName);
    setActiveId(null);
  };

  const handleCreateGroup = () => {
    const newGroup = newGroupName.trim();

    if (!newGroup) {
      toast({
        title: "Group name cannot be empty!",
        description: "Please enter a valid group name.",
        variant: "destructive",
      });

      return;
    }

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

  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string);
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
      <ScrollArea>
        <div className="grid grid-cols-3 2xl:grid-cols-4 gap-4 w-full">
          <DndContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
            <CourseGroupColumn
              groupName="Ungrouped"
              pick={-1}
              courses={courses.filter(
                (course) => !course.group || course.group === "Ungrouped"
              )}
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
            <DragOverlay dropAnimation={{ duration: 150, easing: "ease-out" }}>
              {activeId && (
                <div
                  className={cn(
                    buttonVariants({
                      variant: "outline",
                      className: "w-full",
                    }),
                    "justify-start"
                  )}
                >
                  {activeId}
                </div>
              )}
            </DragOverlay>
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
      </ScrollArea>
    </div>
  );
}

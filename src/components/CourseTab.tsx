"use client";

import { fetchCourse } from "@/lib/actions";
import { useGlobalStore } from "@/stores/useGlobalStore";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import CourseGrid from "./CourseGrid";
import CourseInput from "./CourseInput";
import CourseList from "./CourseList";
import { CourseDataTable } from "./courseTable/CourseDataTable";
import { columns } from "./courseTable/CourseTableColumns";
import { Card, CardContent } from "./ui/card";
import { toast } from "./ui/use-toast";

const CourseTab = () => {
  const { id, courses, setCourses, addCourse, setId } = useGlobalStore(
    useShallow((state) => ({
      courses: state.courses,
      setCourses: state.setCourses,
      id: state.id,
      addCourse: state.addCourse,
      setId: state.setId,
    }))
  );

  const [activeCourse, setActiveCourse] = useState<number>(0);

  const handleFetch = async (courseCode: string) => {
    if (!id) {
      toast({
        title: "You haven't set your ID yet!",
        description: "Set your ID on the button at the top right corner.",
        variant: "destructive",
      });

      return;
    }

    // This is here because ID may accidentally contain quotes
    // Remove this once everyone has migrated properly.
    if (id.includes('"')) {
      setId(id.replaceAll('"', ""));
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

  return (
    <div className="flex gap-4 flex-row flex-grow py-8 px-16 w-full self-stretch min-h-0">
      <div className="flex flex-col gap-4 min-w-72 max-w-72">
        <Card>
          <CardContent className="pt-6">
            <CourseInput
              fetchHandler={handleFetch}
              courses={courses}
              setCourses={setCourses}
            />
          </CardContent>
        </Card>
        <CourseList
          activeCourse={activeCourse}
          setActiveCourse={setActiveCourse}
        />
      </div>
      {!!courses.length && activeCourse !== -1 ? (
        <CourseDataTable
          columns={columns}
          data={courses[activeCourse].classes}
          lastFetched={courses[activeCourse].lastFetched}
          activeCourse={courses[activeCourse].courseCode}
        />
      ) : (
        <CourseGrid />
      )}
    </div>
  );
};

export default CourseTab;

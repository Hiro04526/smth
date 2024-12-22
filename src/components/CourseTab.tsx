"use client";

import { useGlobalStore } from "@/stores/useGlobalStore";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";
import CourseGrid from "./CourseGrid";
import CourseInput from "./CourseInput";
import CourseList from "./CourseList";
import { CourseDataTable } from "./courseTable/CourseDataTable";
import { columns } from "./courseTable/CourseTableColumns";
import { Card, CardContent } from "./ui/card";

const CourseTab = () => {
  const { courses, setCourses } = useGlobalStore(
    useShallow((state) => ({
      courses: state.courses,
      setCourses: state.setCourses,
    }))
  );

  const [activeCourse, setActiveCourse] = useState<number>(0);

  return (
    <div className="flex gap-4 flex-row flex-grow py-8 px-16 w-full self-stretch min-h-0">
      <div className="flex flex-col gap-4 min-w-72 max-w-72">
        <Card>
          <CardContent className="pt-6">
            <CourseInput courses={courses} setCourses={setCourses} />
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
          isCustom={courses[activeCourse].isCustom}
        />
      ) : (
        <CourseGrid />
      )}
    </div>
  );
};

export default CourseTab;

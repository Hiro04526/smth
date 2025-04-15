import { CircleHelp } from "lucide-react";
import { StepCard } from "./HelpDialog";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

interface GroupHelpProps {}

const GroupHelp = (props: GroupHelpProps) => {
  const steps = [
    {
      title: "Create a Group",
      description:
        "Click the 'Create Group' button to start creating a new group for your courses.",
    },
    {
      title: "Add Courses to Group",
      description: "Drag the courses to your newly made group to add them.",
    },
    {
      title: "Set No. of Courses to Pick",
      description:
        "Click on the '...' button on the top right of the group and select 'Change # of picks.' Picks refers to the number of courses you want to take from this group.",
    },
    {
      title: "Generate Schedules",
      description:
        "Once you're done, go to the 'Schedules' tab and click 'Generate Schedules'. This will generate all possible schedules!",
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <CircleHelp className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="inline-flex items-center">
            <CircleHelp className="mr-2 size-4" /> What are Grouped Courses?
          </DialogTitle>
          <DialogDescription>
            Grouped courses allow you to group courses together to create more
            flexible schedules.
          </DialogDescription>
        </DialogHeader>
        {steps.map(({ description, title }, i) => (
          <StepCard
            key={i}
            step={i + 1}
            description={description}
            title={title}
          />
        ))}
      </DialogContent>
    </Dialog>
  );
};
export default GroupHelp;

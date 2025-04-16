import { Class } from "@/lib/definitions";
import { Ellipsis } from "lucide-react";
import { useState } from "react";
import Dropdown, { DropdownItems } from "../common/Dropdown";
import EditClassDialog from "../EditClassDialog";
import { Button } from "../ui/button";

interface Props {
  data: Class;
}

export default function RowSettings({ data }: Props) {
  const [openDelete, setOpenDelete] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const items: DropdownItems[] = [
    {
      name: "Edit",
      onClick: () => {
        setOpenEdit(true);
      },
    },
    {
      name: "Delete",
      onClick: () => {
        console.log("Delete");
      },
    },
  ];

  return (
    <>
      <Dropdown items={items}>
        <Button size="icon" variant="ghost" className="size-6">
          <Ellipsis className="size-4" />
        </Button>
      </Dropdown>
      <EditClassDialog data={data} open={openEdit} setOpen={setOpenEdit} />
    </>
  );
}

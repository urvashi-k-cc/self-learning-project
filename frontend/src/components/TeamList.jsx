import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getTeamsApi } from "../helpers/apiRequest";
import { useEffect, useState } from "react";
import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const TeamsList = () => {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const teamsRes = await getTeamsApi();
        setTeams(teamsRes.teams || []);
      } catch (error) {
        console.error("Error fetching teams:", error);
      }
    };
    loadTeams();
  }, []);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <h1 className="text-2xl font-bold mb-4">Teams</h1>
        </TableRow>
        <TableRow>
          <TableHead>Team Name</TableHead>
          <TableHead>Project</TableHead>
          <TableHead>Members</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {teams.map((team) => (
          <TableRow key={team.id}>
            <TableCell>{team.name}</TableCell>
            <TableCell>{team.project?.name || "N/A"}</TableCell>
            <TableCell>{team.members?.length || 0}</TableCell>
            <TableCell>
              <button className="px-3 py-2 bg-gray-800 text-white rounded-md cursor-pointer">
                <FaEdit />
              </button>
              <button className="px-3 py-2 bg-gray-800 text-white rounded-md cursor-pointer ms-2">
                <MdDelete />
              </button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
export default TeamsList;

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getGroups } from "./services";
// import MainLayout from "../components/MainLayout";

const GroupsPage = () => {
    const [groups, setGroups] = useState([]);

    useEffect(() => {
        const fetchGroups = async () => {
            try {
                const groupsList = await getGroups();
                setGroups(groupsList);
            } catch (error) {
                toast.error("Failed to fetch groups")
            }
        }
        fetchGroups()
    }, []);

    return (
        <>
            {/* <MainLayout title="Groups" items={groups} /> */}
        </>
    );
}

export default GroupsPage;
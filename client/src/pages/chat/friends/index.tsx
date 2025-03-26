import { useEffect, useState } from "react";
import { getFriends } from "./services";
import { toast } from "sonner";
import MainLayout from "../components/MainLayout";

// const friends = [
//     {
//         "conversation_id": "8155b550-7cfb-4234-b8b5-3684c05fa420",
//         "status": "SENDER",
//         "balance_amount": "32050.00",
//         "archival_status": "NONE",
//         "block_status": "NONE",
//         "friend": {
//             "user_id": "79ceb736-1231-4ba0-b6c0-23568004ea7d",
//             "first_name": "Deepanshu",
//             "last_name": "Dixit",
//             "email": "deepanshu6255@gmail.com",
//             "image_url": "https://randomuser.me/api/portraits/men/6.jpg"
//         }
//     },
//     {
//         "conversation_id": "92abfda1-1b34-43f3-b9c2-dc4f9b25e46c",
//         "status": "RECEIVER",
//         "balance_amount": "1500.00",
//         "archival_status": "NONE",
//         "block_status": "NONE",
//         "friend": {
//             "user_id": "24fd69b3-31cc-4821-97b5-7a16c8e43e17",
//             "first_name": "Rahul",
//             "last_name": "Sharma",
//             "email": "rahul.sharma@example.com",
//             "image_url": "https://randomuser.me/api/portraits/men/1.jpg"
//         }
//     },
//     {
//         "conversation_id": "63cd44f9-29b3-4b88-b32f-1cfad3e68f3a",
//         "status": "SENDER",
//         "balance_amount": "500.00",
//         "archival_status": "NONE",
//         "block_status": "NONE",
//         "friend": {
//             "user_id": "47fd9e2c-24a3-4a68-a2f8-cd58b2d84369",
//             "first_name": "Priya",
//             "last_name": "Verma",
//             "email": "priya.verma@example.com",
//             "image_url": "https://randomuser.me/api/portraits/women/3.jpg"
//         }
//     },
//     {
//         "conversation_id": "f7a6dc4b-e02a-4c64-89c3-91c632a9f88e",
//         "status": "RECEIVER",
//         "balance_amount": "8000.75",
//         "archival_status": "NONE",
//         "block_status": "NONE",
//         "friend": {
//             "user_id": "91fb6e33-49c3-4b7a-a726-f3c14d9e582f",
//             "first_name": "Ankita",
//             "last_name": "Singh",
//             "email": "ankita.singh@example.com",
//             "image_url": "https://randomuser.me/api/portraits/women/6.jpg"
//         }
//     },
//     {
//         "conversation_id": "bd3e4b79-2a5d-47c2-899b-bb9a4ebfb615",
//         "status": "SENDER",
//         "balance_amount": "12000.00",
//         "archival_status": "NONE",
//         "block_status": "NONE",
//         "friend": {
//             "user_id": "6a5c9b7d-32a3-4678-9bde-5f8b43218c46",
//             "first_name": "Vikram",
//             "last_name": "Mehta",
//             "email": "vikram.mehta@example.com",
//             "image_url": "https://randomuser.me/api/portraits/men/9.jpg"
//         }
//     }
// ];

// const StyledBadge = styled(Badge)<BadgeProps>(() => ({
//     '& .MuiBadge-badge': {
//         right: -10,
//         top: 5,
//         padding: '0 4px',
//     },
// }));
const FriendsPage = () => {
    // const [selected, setSelected] = useState("Friends");
    // const [currentView, setCurrentView] = useState("All");
    // const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    // const open = Boolean(anchorEl);
    // const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    //     setAnchorEl(event.currentTarget);
    // };
    // const handleClose = () => {
    //     setAnchorEl(null);
    // };

    // const handleChange = (event: SelectChangeEvent) => {
    //     setCurrentView(event.target.value);
    // };
    // return (
    //     <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
    //         <div className="bg-white h-full flex flex-col items-center justify-center col-span-1 p-4 rounded-lg space-y-6">
    //             <div className="flex flex-row items-center justify-center w-full gap-2">
    //                 <TextField
    //                     placeholder="Search using email"
    //                     variant="outlined"
    //                     name="search_field"
    //                     size="small"
    //                     fullWidth
    //                     slotProps={{
    //                         input: {
    //                             endAdornment: (
    //                                 <InputAdornment position="end">
    //                                     <Search />
    //                                 </InputAdornment>
    //                             ),
    //                         },
    //                     }}
    //                 />
    //                 <Button className="h-full rounded-3xl" variant="contained" color="primary">
    //                     <PersonAddAlt1Sharp />
    //                 </Button>
    //             </div>
    //             <div className="w-full space-y-4">
    //                 <div className="items-center justify-center w-full">
    //                     <ButtonGroup className="items-center justify-center w-full" size="large" variant="contained">
    //                         <Button onClick={() => setSelected("Friends")}
    //                             sx={{
    //                                 flex: 1,
    //                                 bgcolor: selected === "Friends" ? "#3b82f6" : "white",
    //                                 color: selected === "Friends" ? "white" : "#3b82f6",
    //                                 "&:hover": {
    //                                     bgcolor: "#2563eb",
    //                                     color: "white",
    //                                 },
    //                             }}>Friends</Button>
    //                         <Button onClick={() => setSelected("Requests")}
    //                             sx={{
    //                                 flex: 1,
    //                                 bgcolor: selected === "Requests" ? "#3b82f6" : "white",
    //                                 color: selected === "Requests" ? "white" : "#3b82f6",
    //                                 "&:hover": {
    //                                     bgcolor: "#2563eb",
    //                                     color: "white",
    //                                 },
    //                             }}>
    //                             <StyledBadge badgeContent={1} color="secondary">
    //                                 Requests
    //                             </StyledBadge>
    //                         </Button>
    //                     </ButtonGroup>
    //                 </div>
    //                 <div className="flex flex-col justify-center items-center w-full min-h-[60vh] max-h-[60vh] overflow-y-auto">
    //                     {friends.map((friend, index) => (
    //                         <div key={index} className="flex flex-row items-center justify-between w-full p-4">
    //                             <div className="flex flex-row items-center gap-4 w-full">
    //                                 <img src={friend.friend.image_url} alt={friend.friend.first_name} className="h-10 w-10 rounded-full" />
    //                                 <div className="flex flex-col">
    //                                     <h5 className="text-md font-semibold">{friend.friend.first_name} {friend.friend.last_name}</h5>
    //                                     <p className="text-sm">{friend.friend.email}</p>
    //                                 </div>
    //                             </div>
    //                             <h6 className={`text-md ${getBalanceAsNumber(friend.balance_amount) < 0 ? "text-red-600" : "text-green-600"}`}>
    //                                 {friend.balance_amount}
    //                             </h6>
    //                         </div>
    //                     ))}
    //                 </div>
    //             </div>
    //         </div>
    //         <div className="bg-white h-full flex flex-col col-span-1 lg:col-span-2 p-4 rounded-lg">
    //             <div className="flex flex-row items-center justify-between p-2">
    //                 <div className="flex flex-row items-center gap-2">
    //                     <IconButton>
    //                         <ArrowBack />
    //                     </IconButton>
    //                     <img src="https://randomuser.me/api/portraits/men/9.jpg" alt="profile_image" className="h-10 w-10 rounded-full" />
    //                     <h5 className="text-lg font-semibold">Friend Name</h5>
    //                 </div>
    //                 <div className="flex flex-row items-center gap-2">
    //                     <div>
    //                         <Select
    //                             value={currentView}
    //                             onChange={handleChange}
    //                         >
    //                             <MenuItem value="All">All</MenuItem>
    //                             <MenuItem value="Expenses">Expenses</MenuItem>
    //                             <MenuItem value="Messages">Messages</MenuItem>
    //                         </Select>
    //                     </div>
    //                     <div>
    //                         <IconButton
    //                             aria-label="more"
    //                             id="long-button"
    //                             aria-controls={open ? 'long-menu' : undefined}
    //                             aria-expanded={open ? 'true' : undefined}
    //                             aria-haspopup="true"
    //                             onClick={handleClick}
    //                         >
    //                             <MoreVert />
    //                         </IconButton>
    //                         <Menu
    //                             anchorEl={anchorEl}
    //                             open={open}
    //                             onClose={handleClose}
    //                             slotProps={{
    //                                 paper: {
    //                                     style: {
    //                                         maxHeight: ITEM_HEIGHT * 4.5,
    //                                         width: '20ch',
    //                                     },
    //                                 },
    //                             }}
    //                         >
    //                             {options.map((option) => (
    //                                 <MenuItem key={option} selected={option === 'Pyxis'} onClick={handleClose}>
    //                                     {option}
    //                                 </MenuItem>
    //                             ))}
    //                         </Menu>
    //                     </div>
    //                 </div>
    //             </div>
    //             <hr className="border-t-4 border-gray-500" />
    //             <div className="min-h-90 max-h-90 overflow-y-auto">
    //             </div>
    //             <hr className="border-t-4 border-gray-500" />
    //             <div className="flex flex-row items-center gap-3 p-2 pt-4">
    //                 <div>
    //                     <Button variant="contained" color="primary">Add Expense</Button>
    //                 </div>
    //                 <div className="flex-1">
    //                     <TextField
    //                         placeholder="Search using email"
    //                         variant="outlined"
    //                         name="search_field"
    //                         size="small"
    //                         fullWidth
    //                         slotProps={{
    //                             input: {
    //                                 endAdornment: (
    //                                     <InputAdornment position="end">
    //                                         <Send />
    //                                     </InputAdornment>
    //                                 ),
    //                             },
    //                         }}
    //                     />
    //                 </div>
    //             </div>
    //         </div>
    //     </div>
    // );
    const [friends, setFriends] = useState([]);

    useEffect(() => {
        const fetchFriends = async () => {
            try {
                const friendsList = await getFriends();
                setFriends(friendsList);
            } catch (error) {
                toast.error("Failed to fetch friends")
            }
        }
        fetchFriends()
    }, []);

    return (
        <MainLayout title="Friends" items={friends} />
        // <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 p-4">
        //     {/* Left Panel */}
        //     <div className="bg-white h-full flex flex-col items-center col-span-1 p-4 rounded-lg space-y-6">
        //         <SearchBar />
        //         <div className="items-center justify-center w-full">
        //             <ButtonGroup className="items-center justify-center w-full" size="large" variant="contained">
        //                 <Button onClick={() => setSelected("Friends")}
        //                     sx={{
        //                         flex: 1,
        //                         bgcolor: selected === "Friends" ? "#3b82f6" : "white",
        //                         color: selected === "Friends" ? "white" : "#3b82f6",
        //                         "&:hover": {
        //                             bgcolor: "#2563eb",
        //                             color: "white",
        //                         },
        //                     }}>Friends</Button>
        //                 <Button onClick={() => setSelected("Requests")}
        //                     sx={{
        //                         flex: 1,
        //                         bgcolor: selected === "Requests" ? "#3b82f6" : "white",
        //                         color: selected === "Requests" ? "white" : "#3b82f6",
        //                         "&:hover": {
        //                             bgcolor: "#2563eb",
        //                             color: "white",
        //                         },
        //                     }}>
        //                     <StyledBadge badgeContent={1} color="secondary">
        //                         Requests
        //                     </StyledBadge>
        //                 </Button>
        //             </ButtonGroup>
        //         </div>
        //         <ChatList friends={friends} />
        //     </div>

        //     {/* Right Panel */}
        //     <div className="bg-white h-full flex flex-col col-span-1 lg:col-span-2 p-4 rounded-lg">
        //         <ChatHeader currentView={currentView} setCurrentView={setCurrentView} handleClick={handleClick} anchorEl={anchorEl} handleClose={handleClose} />
        //         <hr className="border-t-4 border-gray-500" />
        //         <ChatWindow />
        //         <hr className="border-t-4 border-gray-500" />
        //         <MessageInput />
        //     </div>
        // </div>
    );
}

export default FriendsPage;
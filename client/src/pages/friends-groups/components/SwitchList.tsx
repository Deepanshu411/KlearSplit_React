import { Badge, BadgeProps, Button, ButtonGroup, styled } from "@mui/material";
import React from "react";

interface SwitchListProps {
    title: string;
    selected: string;
    setSelected: (value: string) => void;
    requestsLength: number;
}

const StyledBadge = styled(Badge)<BadgeProps>(() => ({
    '& .MuiBadge-badge': {
        right: -10,
        top: 5,
        padding: '0 4px',
    },
}));

const SwitchList: React.FC<SwitchListProps> = ({ title, selected, setSelected, requestsLength }) => {
    return (
        <div className="items-center justify-center w-full">
            <ButtonGroup className="items-center justify-center w-full" size="large" variant="contained">
                <Button onClick={() => setSelected(title)}
                    sx={{
                        flex: 1,
                        bgcolor: selected === title ? "#3b82f6" : "white",
                        color: selected === title ? "white" : "#3b82f6",
                        "&:hover": {
                            bgcolor: "#2563eb",
                            color: "white",
                        },
                    }}>{title}</Button>
                <Button onClick={() => setSelected("Requests")}
                    sx={{
                        flex: 1,
                        bgcolor: selected === "Requests" ? "#3b82f6" : "white",
                        color: selected === "Requests" ? "white" : "#3b82f6",
                        "&:hover": {
                            bgcolor: "#2563eb",
                            color: "white",
                        },
                    }}>
                    <StyledBadge badgeContent={requestsLength} color="secondary">
                        Requests
                    </StyledBadge>
                </Button>
            </ButtonGroup>
        </div>
    );
}

export default SwitchList;
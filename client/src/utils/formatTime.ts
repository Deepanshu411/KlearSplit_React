const formatTime = (isoString: string) => {
    return new Intl.DateTimeFormat("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // 24-hour format
    }).format(new Date(isoString));
};

export default formatTime;
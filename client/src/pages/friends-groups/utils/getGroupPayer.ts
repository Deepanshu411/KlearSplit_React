const isUserPayer = (userId: string, payerId: string) => {
    return userId === payerId;
};

export default isUserPayer;
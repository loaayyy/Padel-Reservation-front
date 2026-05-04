import { Axios } from "axios";

export const fetchReservedTimes = async (date) => {
    try {
        const response = await Axios.get(`/api/bookings?date=${date}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching reserved times:", error);
        return [];
    }
};
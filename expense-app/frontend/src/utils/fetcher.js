import http from "./http";

const fetcher = async(url) => {
    try {
        const { data } = await http.get(url);
        if (Array.isArray(data)) return data;
        if (data?.data) return data;
        if (data?.transactions) return data.transactions;
        if (data?.users) return data.users;
        return [];
    } catch (err) {
        return [];
    }
}

export default fetcher;
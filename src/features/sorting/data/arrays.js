//preset array configurations for sorting algorithm visualisations
export const defaultArray = [38, 27, 43, 10, 18, 5, 31, 22];

export const presets = {
    random: (size) => Array.from({ length: size }, () => Math.floor(Math.random() * 90) + 10),
    nearlySorted: (size) => {
        const arr = Array.from({ length: size }, (_, i) => i + 1);
        for (let i = 0; i < Math.max(2, Math.floor(size / 5)); i++) {
            const a = Math.floor(Math.random() * size);
            const b = Math.floor(Math.random() * size);
            [arr[a], arr[b]] = [arr[b], arr[a]];
        }
        return arr.map(v => v * Math.floor(100 / size));
    },
    reversed: (size) => Array.from({ length: size }, (_, i) => (size - i) * Math.floor(100 / size)),
    fewUnique: (size) => {
        const vals = [10, 30, 50, 70, 90];
        return Array.from({ length: size }, () => vals[Math.floor(Math.random() * vals.length)]);
    },
};
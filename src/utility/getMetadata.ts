import ExifReader from "exifreader";

export async function getLocation(file: File): Promise<{ lat: number; lng: number } | null> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const tags = ExifReader.load(arrayBuffer);
        const lat = tags['GPSLatitude']?.description;
        const lng = tags['GPSLongitude']?.description;
        if (lat && lng) {
            return { lat: parseFloat(lat), lng: parseFloat(lng) };
        }
    } catch (e) {
        console.warn("Gagal membaca EXIF lokasi:", e);
    }
    return null;
}

export async function getDateTime(file: File): Promise<string | null> {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const tags = ExifReader.load(arrayBuffer);
        const dateTime = tags['DateTimeOriginal']?.description;
        return dateTime || null;
    } catch (e) {
        console.warn("Gagal membaca EXIF tanggal:", e);
        return null;
    }
}
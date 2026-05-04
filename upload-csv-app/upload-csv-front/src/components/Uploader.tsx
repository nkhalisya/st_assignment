import { ChangeEvent, useState } from "react";
import PaginationTable from "./PaginationTable";

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export default function Uploader() {

    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<UploadStatus>('idle');

    function handleChooseFile(e: ChangeEvent<HTMLInputElement>){
        if(e.target.files) {
            setFile(e.target.files[0]);
        }
    }

    const handleFileUpload = async () => {
        if(!file) return;

        setStatus('uploading');
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('http://127.0.0.1:7000/upload', {
                method: 'POST',
                body: formData
            });
            const data = await res.json();
            console.log(data);

            setStatus('success');
        } catch (error) {
            console.log(error)
            setStatus('error');
        }


    }

    return(
        <div className="Uploader">
            <input type="file" onChange={handleChooseFile}></input>
            <div>
                {
                    file && status !== 'uploading' && (
                        <button onClick={handleFileUpload}>Upload CSV File</button>
                    )
                }
                {
                    status === 'success' && (
                        <PaginationTable></PaginationTable>
                    )
                }
                {
                    status === 'error' && (
                        <p>Upload Failed :(</p>
                    )
                }
            </div>
        </div>
    )
}
import { ChangeEvent, useEffect, useState } from "react";
import Pagination from 'react-bootstrap/Pagination';

export default function PaginationTable() {

    const [duplicateRows, setDuplicateRows] = useState([]);
    useEffect(() => {
        fetch("http://127.0.0.1:7000/checkDuplicates")
          .then((res) => res.json())
          .then((data) => setDuplicateRows(data))
          .catch((err) => console.error(err));
    }, []);
    const [conflictRows, setconflictRows] = useState([]);
    useEffect(() => {
        fetch("http://127.0.0.1:7000/checkConflicts")
          .then((res) => res.json())
          .then((data) => setconflictRows(data))
          .catch((err) => console.error(err));
    }, []);


    const [search, setSearch] = useState("");
    const [data, setData] = useState<any>([]);
    const [page, setPage] = useState(1);
    const [pageCount, setPageCount] = useState(1);
    const limit = 20;
    const fetchData = async (pageNum: number) => {
        const res = await fetch(`http://127.0.0.1:7000/data?page=${pageNum}&limit=${limit}&search=${search}`);
        const result = await res.json();
        setData(result.data);
        setPageCount(result.totalPages);
    };

    useEffect(() => {
        fetchData(page);
    }, [page, search]);

    
    function handleSearch(e:ChangeEvent<HTMLInputElement>) {
        setPage(1);
        setSearch(e.target.value);
    }

    return(
        <div className="PaginationTable">
            <div className="searchBox">
                <label>Search:</label>&nbsp;
                <input type="text" placeholder="Enter text here" onChange={handleSearch}></input>
            </div>

            <div>
                <br/>
                {
                    duplicateRows[0]>0 ? `Duplicated Rows: ${duplicateRows[0]}` : ''
                }
                <br/>
                {
                    conflictRows[0]>0 ? `Conflicting Rows: ${conflictRows[0]}` : ''
                }
                <Pagination className="pagination-bar">
                    <Pagination.Prev 
                        disabled={page===1} 
                        onClick={() => setPage(page-1)}
                    />
                    <Pagination.Item active>{page}</Pagination.Item>
                    <Pagination.Item disabled>Of {pageCount} Pages</Pagination.Item>
                    <Pagination.Next 
                        disabled={page===pageCount}
                        onClick={() => setPage(page+1)}
                    />
                </Pagination>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>PostId</th>
                        <th>Id</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Body</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        data.map((d:any) => (
                            <tr key={d.id} className={`${d.duplicateid ? 'duplicateRow' : ''} ${d.conflictid ? 'conflictRow' : ''}`}>
                                <td>{d.postid}</td>
                                <td>{d.id}</td>
                                <td>{d.name}</td>
                                <td>{d.email}</td>
                                <td>{d.body}</td>
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </div>
    )
}
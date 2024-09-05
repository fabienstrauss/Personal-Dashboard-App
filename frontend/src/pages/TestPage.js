import React, { useEffect, useState } from 'react';

function TestPage() {
    const [data, setData] = useState(null);

    useEffect(() => {
        fetch('http://localhost:3001/test')
            .then((response) => response.json())
            .then((data) => {
                setData(data);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <div>
            <h1>Test Database Connection</h1>
            {data ? (
                <pre>{JSON.stringify(data, null, 2)}</pre>
            ) : (
                <p>Loading data...</p>
            )}
        </div>
    );
}

export default TestPage;
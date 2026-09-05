"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const OWNER_ID =
  "c710c6ac-87ff-4474-9f8c-2643e61485fd";

export default function Home() {
  const [files, setFiles] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);

  const fetchFiles = async (pageNumber: number) => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/search`,
        {
          params: {
            ownerId: OWNER_ID,
            page: pageNumber,
            limit: 10
          }
        }
      );

      const data = response.data;

      if (pageNumber === 1) {
        setFiles(data.results.files || []);
        setFolders(data.results.folders || []);
      } else {
        setFiles((prev) => [
          ...prev,
          ...(data.results.files || [])
        ]);

        setFolders((prev) => [
          ...prev,
          ...(data.results.folders || [])
        ]);
      }

      setHasNextPage(
        data.pagination.hasNextPage
      );

    } catch (error) {
      console.error(
        "Failed to load files:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(1);
  }, []);

  const loadMore = () => {
    const nextPage = page + 1;

    setPage(nextPage);
    fetchFiles(nextPage);
  };

  return (
    <main className="min-h-screen p-8">

      <h1 className="text-3xl font-bold mb-6">
        Cloud Media Storage
      </h1>

      <h2 className="text-xl font-semibold mb-3">
        Files
      </h2>

      <div className="space-y-2">
        {files.map((file) => (
          <div
            key={file.id}
            className="border rounded-lg p-3"
          >
            {file.name}
          </div>
        ))}
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-3">
        Folders
      </h2>

      <div className="space-y-2">
        {folders.map((folder) => (
          <div
            key={folder.id}
            className="border rounded-lg p-3"
          >
            📁 {folder.name}
          </div>
        ))}
      </div>

      {loading && (
        <p className="mt-6">
          Loading...
        </p>
      )}

      {!loading && hasNextPage && (
        <button
          onClick={loadMore}
          className="mt-6 px-5 py-2 rounded-lg border"
        >
          Load More
        </button>
      )}

      {!loading && !hasNextPage && (
        <p className="mt-6">
          No more files or folders.
        </p>
      )}

    </main>
  );
}
"use client";

import { useEffect, useState } from "react";
import axios from "axios";

const API = "https://cloud-storage-backend-jc75.onrender.com";
const USER_ID = "c710c6ac-87ff-4474-9f8c-2643e61485fd";

type FileItem = {
  id: string;
  name: string;
  size_bytes: number;
  mime_type: string;
  created_at: string;
};

type FolderItem = {
  id: string;
  name: string;
  created_at: string;
};

type Breadcrumb = {
  id: string | null;
  name: string;
};

type ShareItem = {
  id: string;
  resource_type: string;
  resource_id: string;
  grantee_user_id: string;
  role: "viewer" | "editor";
  created_by: string;
  created_at: string;
};

type PublicLink = {
  id: string;
  file_id: string;
  token: string;
  created_by: string;
  is_active: boolean;
  expires_at: string | null;
};

type VersionItem = {
  id: string;
  file_id: string;
  version_number: number;
  storage_key: string;
  size_bytes: number;
  mime_type: string;
  created_by: string;
  created_at: string;
};

export default function DashboardPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
const [newFolderName, setNewFolderName] = useState("");
const [folderCreating, setFolderCreating] = useState(false);
const [folderMessage, setFolderMessage] = useState("");
const [folderError, setFolderError] = useState("");
  const [loading, setLoading] = useState(true);
const [showProfile, setShowProfile] = useState(false);
const [profile, setProfile] = useState<any>(null);
const [profileLoading, setProfileLoading] = useState(false);
  const [currentFolder, setCurrentFolder] =
    useState<string | null>(null);

  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([
    {
      id: null,
      name: "My Files",
    },
  ]);
  // =========================
// CREATE FOLDER
// =========================

const handleCreateFolder = async () => {
  if (!newFolderName.trim()) {
    setFolderError("Please enter a folder name.");
    return;
  }

  try {
    setFolderCreating(true);
    setFolderMessage("");
    setFolderError("");

    const response = await axios.post(
      `${API}/api/folders`,
      {
        name: newFolderName.trim(),
        ownerId: USER_ID,
        parentId: currentFolder || null,
      },
      {
        headers: getHeaders(),
      }
    );
    
    setFolderMessage(
      response.data.message || "Folder created successfully."
    );

    setNewFolderName("");
    setShowCreateFolder(false);

    await fetchItems(currentFolder);
  } catch (err: any) {
    console.error("Create folder failed:", err);

    setFolderError(
      err.response?.data?.message ||
        "Failed to create folder."
    );
  } finally {
    setFolderCreating(false);
  }
};
// =========================
// VIEW PROFILE
// =========================

const handleViewProfile = async () => {
  try {
    setProfileLoading(true);

    const response = await axios.get(
      `${API}/api/auth/me`,
      {
        headers: getHeaders(),
      }
    );

    setProfile(response.data.user || response.data);
    setShowProfile(true);
  } catch (err: any) {
    console.error("Failed to load profile:", err);

    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setProfile(JSON.parse(savedUser));
      setShowProfile(true);
    }
  } finally {
    setProfileLoading(false);
  }
};
  // =========================
  // DAY 12 - SEARCH & SORT
  // =========================

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // =========================
  // UPLOAD STATES
  // =========================

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null);

  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploadFolderId, setUploadFolderId] = useState<string | null>(null);
  // =========================
  // TRASH STATES - DAY 13
  // =========================

  const [showTrash, setShowTrash] = useState(false);
  const [trashFiles, setTrashFiles] = useState<FileItem[]>([]);
  const [trashLoading, setTrashLoading] = useState(false);
  const [trashMessage, setTrashMessage] = useState("");
  const [trashError, setTrashError] = useState("");

  // =========================
  // VERSION STATES - DAY 13
  // =========================

  const [versionOpen, setVersionOpen] = useState(false);
  const [versionFile, setVersionFile] =
    useState<FileItem | null>(null);

  const [versions, setVersions] =
    useState<VersionItem[]>([]);

  const [versionLoading, setVersionLoading] =
    useState(false);

  const [versionUploading, setVersionUploading] =
    useState(false);

  const [versionSelectedFile, setVersionSelectedFile] =
    useState<File | null>(null);

  const [versionMessage, setVersionMessage] =
    useState("");

  const [versionError, setVersionError] =
    useState("");

  // =========================
  // SHARE STATES
  // =========================

  const [shareOpen, setShareOpen] = useState(false);

  const [shareResourceType, setShareResourceType] =
    useState<"file" | "folder">("file");

  const [shareResourceId, setShareResourceId] =
    useState("");

  const [shareResourceName, setShareResourceName] =
    useState("");

  const [granteeUserId, setGranteeUserId] =
    useState("");

  const [shareRole, setShareRole] =
    useState<"viewer" | "editor">("viewer");

  const [shares, setShares] =
    useState<ShareItem[]>([]);

  const [shareLoading, setShareLoading] =
    useState(false);

  const [shareMessage, setShareMessage] =
    useState("");

  const [shareError, setShareError] =
    useState("");

  // =========================
  // PUBLIC LINK STATES
  // =========================

  const [publicLink, setPublicLink] =
    useState<PublicLink | null>(null);

  const [publicLinkLoading, setPublicLinkLoading] =
    useState(false);

  const [publicLinkMessage, setPublicLinkMessage] =
    useState("");

  // =========================
  // GET TOKEN
  // =========================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================
  // AUTH HEADERS
  // =========================

  const getHeaders = () => {
    const token = getToken();

    return {
      Authorization: `Bearer ${token}`,
    };
  };

  // =========================
  // FETCH FILES / FOLDERS
  // =========================

  useEffect(() => {
    fetchItems(currentFolder);
  }, [currentFolder]);

  const fetchItems = async (
    folderId: string | null
  ) => {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login again.");
        setLoading(false);
        return;
      }

      if (!folderId) {
        const response = await axios.get(
          `${API}/api/search`,
          {
            params: {
              ownerId: USER_ID,
              page: 1,
              limit: 100,
            },
            headers: getHeaders(),
          }
        );

        // My Files should show only files that are not inside any folder.
        // Files inside folders have a non-null folder_id.
        const rootFiles = (response.data.results?.files || []).filter(
          (file: any) => !file.folder_id
        );

        setFiles(rootFiles);

        setFolders(
          response.data.results?.folders || []
        );
      } else {
        const response = await axios.get(
          `${API}/api/folders/${folderId}`,
          {
            params: {
              ownerId: USER_ID,
            },
            headers: getHeaders(),
          }
        );

        setFiles(
  response.data.children?.files || []
);

setFolders(
  response.data.children?.folders || []
);
      }
    } catch (err: any) {
      console.error(
        "Failed to fetch folder contents:",
        err
      );

      setFiles([]);
      setFolders([]);

      setError(
        err.response?.data?.message ||
        "Failed to load files."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // SEARCH & SORT
  // =========================

  const filteredFiles = files
    .filter((file) =>
      file.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "size") {
        return b.size_bytes - a.size_bytes;
      }

      if (sortBy === "date") {
        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      }

      return 0;
    });

  const filteredFolders = folders
    .filter((folder) =>
      folder.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === "date") {
        return (
          new Date(b.created_at).getTime() -
          new Date(a.created_at).getTime()
        );
      }

      return a.name.localeCompare(b.name);
    });

  // =========================
  // DRAG & DROP
  // =========================

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();

    const file = e.dataTransfer.files[0];

    if (file) {
      setSelectedFile(file);
      setMessage("");
      setError("");
      setUploadProgress(0);
    }
  };

  // =========================
  // FILE SELECT
  // =========================

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (file) {
      setSelectedFile(file);
      setMessage("");
      setError("");
      setUploadProgress(0);
    }
  };

  // =========================
  // UPLOAD FILE
  // =========================

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file first.");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);
      setMessage("");
      setError("");

      const token = getToken();

      if (!token) {
        setError("Please login again.");
        return;
      }

      const formData = new FormData();

      formData.append("file", selectedFile);
      formData.append("ownerId", USER_ID);

const targetFolderId =
  uploadFolderId !== null
    ? uploadFolderId
    : currentFolder;

if (targetFolderId) {
  formData.append("folderId", targetFolderId);
}

      await axios.post(
        `${API}/api/files/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },

          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round(
                (progressEvent.loaded * 100) /
                progressEvent.total
              );

              setUploadProgress(percent);
            }
          },
        }
      );

      setUploadProgress(100);

      setMessage(
        "File uploaded successfully!"
      );

      const uploadedFolderId = targetFolderId;

      setSelectedFile(null);
      setUploadFolderId(null);

      if (uploadedFolderId) {
        const selectedFolder = folders.find(
          (folder) => folder.id === uploadedFolderId
        );

        if (selectedFolder && currentFolder !== uploadedFolderId) {
          setCurrentFolder(uploadedFolderId);

          setBreadcrumbs((prev) => {
            const existingIndex = prev.findIndex(
              (item) => item.id === uploadedFolderId
            );

            if (existingIndex >= 0) {
              return prev.slice(0, existingIndex + 1);
            }

            return [
              ...prev,
              {
                id: selectedFolder.id,
                name: selectedFolder.name,
              },
            ];
          });
        } else {
          await fetchItems(uploadedFolderId);
        }
      } else {
        await fetchItems(currentFolder);
      }
    } catch (err: any) {
      console.error("Upload failed:", err);

      setError(
        err.response?.data?.message ||
        "File upload failed. Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  // =========================
  // OPEN FILE
  // =========================

  const handleOpenFile = async (file: FileItem) => {
    try {
      setError("");

      const response = await axios.get(
        `${API}/api/files/${file.id}/download`,
        {
          headers: getHeaders(),
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: file.mime_type || "application/octet-stream",
      });

      const url = window.URL.createObjectURL(blob);

      window.open(url, "_blank");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (err: any) {
      console.error("Open file failed:", err);

      setError(
        err.response?.data?.message ||
          "Unable to open this file."
      );
    }
  };

  // =========================
  // OPEN FOLDER
  // =========================

  const openFolder = (
    folder: FolderItem
  ) => {
    setCurrentFolder(folder.id);
    setUploadFolderId(null);

    setBreadcrumbs((prev) => [
      ...prev,
      {
        id: folder.id,
        name: folder.name,
      },
    ]);

    setSearchQuery("");
  };

  // =========================
  // BREADCRUMB
  // =========================

  const goToBreadcrumb = (
    index: number
  ) => {
    const selected =
      breadcrumbs[index];

    setCurrentFolder(
      selected.id
    );

    setBreadcrumbs(
      breadcrumbs.slice(
        0,
        index + 1
      )
    );

    setSearchQuery("");
  };

  // =========================
  // FORMAT FILE SIZE
  // =========================

  const formatSize = (
    bytes: number
  ) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }

    if (bytes < 1024 * 1024) {
      return `${(
        bytes / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      bytes /
      (1024 * 1024)
    ).toFixed(1)} MB`;
  };

  // =========================================================
  // DAY 13 - TRASH
  // =========================================================

  const fetchTrash = async () => {
    try {
      setTrashLoading(true);
      setTrashMessage("");
      setTrashError("");

      const response = await axios.get(
        `${API}/api/files/trash/list`,
        {
          params: {
            ownerId: USER_ID,
          },
          headers: getHeaders(),
        }
      );

      setTrashFiles(
        response.data.trash || []
      );

      setShowTrash(true);
    } catch (err: any) {
      console.error(
        "Failed to fetch trash:",
        err
      );

      setTrashError(
        err.response?.data?.message ||
        "Failed to load trash."
      );
    } finally {
      setTrashLoading(false);
    }
  };

  // =========================
  // RESTORE FROM TRASH
  // =========================

  const handleRestore = async (
    fileId: string
  ) => {
    try {
      setTrashMessage("");
      setTrashError("");

      const response = await axios.post(
        `${API}/api/files/${fileId}/restore`,
        {},
        {
          headers: getHeaders(),
        }
      );

      setTrashMessage(
        response.data.message ||
        "File restored successfully."
      );

      await fetchTrash();
      await fetchItems(currentFolder);
    } catch (err: any) {
      console.error(
        "Restore failed:",
        err
      );

      setTrashError(
        err.response?.data?.message ||
        "Failed to restore file."
      );
    }
  };

  // =========================
  // PERMANENT DELETE
  // =========================

  const handlePermanentDelete =
    async (
      fileId: string
    ) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to permanently delete this file?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setTrashMessage("");
        setTrashError("");

        const response =
          await axios.delete(
            `${API}/api/files/${fileId}/permanent`,
            {
              data: {
                ownerId: USER_ID,
              },
              headers: getHeaders(),
            }
          );

        setTrashMessage(
          response.data.message ||
          "File permanently deleted."
        );

        await fetchTrash();
      } catch (err: any) {
        console.error(
          "Permanent delete failed:",
          err
        );

        setTrashError(
          err.response?.data?.message ||
          "Failed to permanently delete file."
        );
      }
    };
  // =========================
// DELETE FOLDER
// =========================

const handleDeleteFolder = async (folderId: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this folder?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setMessage("");
    setError("");

    const response = await axios.delete(
      `${API}/api/folders/${folderId}`,
      {
        data: {
          ownerId: USER_ID,
        },
        headers: getHeaders(),
      }
    );

    setMessage(
      response.data.message || "Folder deleted successfully."
    );

    await fetchItems(currentFolder);
  } catch (err: any) {
    console.error("Delete folder failed:", err);

    setError(
      err.response?.data?.message ||
        "Failed to delete folder."
    );
  }
};

// =========================
// MOVE FILE TO TRASH
// =========================

const handleMoveToTrash = async (fileId: string) => {
  const confirmed = window.confirm(
    "Are you sure you want to move this file to Trash?"
  );

  if (!confirmed) {
    return;
  }

  try {
    setMessage("");
    setError("");

    const response = await axios.delete(
      `${API}/api/files/${fileId}`,
      {
        headers: getHeaders(),
      }
    );

    setMessage(
      response.data.message || "File moved to Trash."
    );

    await fetchItems(currentFolder);
  } catch (err: any) {
    console.error("Move to Trash failed:", err);

    setError(
      err.response?.data?.message ||
        "Failed to move file to Trash."
    );
  }
};
  // =========================================================
  // DAY 13 - VERSIONING
  // =========================================================

  const openVersionModal = async (
    file: FileItem
  ) => {
    setVersionFile(file);
    setVersionOpen(true);

    setVersions([]);
    setVersionSelectedFile(null);
    setVersionMessage("");
    setVersionError("");

    await fetchVersions(file.id);
  };

  // =========================
  // FETCH VERSION HISTORY
  // =========================

  const fetchVersions = async (
    fileId: string
  ) => {
    try {
      setVersionLoading(true);
      setVersionError("");

      const response =
        await axios.get(
          `${API}/api/files/${fileId}/versions`,
          {
            headers: getHeaders(),
          }
        );

      setVersions(
        response.data.versions || []
      );
    } catch (err: any) {
      console.error(
        "Failed to fetch versions:",
        err
      );

      setVersionError(
        err.response?.data?.message ||
        "Failed to load versions."
      );
    } finally {
      setVersionLoading(false);
    }
  };

  // =========================
  // SELECT NEW VERSION
  // =========================

  const handleVersionFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (file) {
      setVersionSelectedFile(file);
      setVersionMessage("");
      setVersionError("");
    }
  };

  // =========================
  // UPLOAD NEW VERSION
  // =========================

  const handleUploadVersion =
    async () => {
      if (!versionFile) {
        return;
      }

      if (!versionSelectedFile) {
        setVersionError(
          "Please select a file."
        );
        return;
      }

      try {
        setVersionUploading(true);
        setVersionMessage("");
        setVersionError("");

        const formData =
          new FormData();

        formData.append(
          "file",
          versionSelectedFile
        );

        formData.append(
          "createdBy",
          USER_ID
        );

        const response =
          await axios.post(
            `${API}/api/files/${versionFile.id}/versions`,
            formData,
            {
              headers: {
                ...getHeaders(),
              },
            }
          );

        setVersionMessage(
          response.data.message ||
          "New version uploaded successfully."
        );

        setVersionSelectedFile(null);

        await fetchVersions(
          versionFile.id
        );

        await fetchItems(
          currentFolder
        );
      } catch (err: any) {
        console.error(
          "Version upload failed:",
          err
        );

        setVersionError(
          err.response?.data?.message ||
          "Failed to upload new version."
        );
      } finally {
        setVersionUploading(false);
      }
    };

  // =========================
  // RESTORE OLD VERSION
  // =========================

  const handleRestoreVersion =
    async (
      versionId: string
    ) => {
      if (!versionFile) {
        return;
      }

      const confirmed =
        window.confirm(
          "Restore this version as the current file?"
        );

      if (!confirmed) {
        return;
      }

      try {
        setVersionLoading(true);
        setVersionMessage("");
        setVersionError("");

        const response =
          await axios.post(
            `${API}/api/files/${versionFile.id}/versions/${versionId}/restore`,
            {},
            {
              headers:
                getHeaders(),
            }
          );

        setVersionMessage(
          response.data.message ||
          "File version restored successfully."
        );

        await fetchVersions(
          versionFile.id
        );

        await fetchItems(
          currentFolder
        );
      } catch (err: any) {
        console.error(
          "Restore version failed:",
          err
        );

        setVersionError(
          err.response?.data?.message ||
          "Failed to restore version."
        );
      } finally {
        setVersionLoading(false);
      }
    };

  // =========================================================
  // SHARE
  // =========================================================

  const openShareModal = async (
    resourceType: "file" | "folder",
    resourceId: string,
    resourceName: string
  ) => {
    setShareOpen(true);

    setShareResourceType(
      resourceType
    );

    setShareResourceId(
      resourceId
    );

    setShareResourceName(
      resourceName
    );

    setGranteeUserId("");
    setShareRole("viewer");

    setShareMessage("");
    setShareError("");

    setPublicLink(null);
    setPublicLinkMessage("");

    await fetchShares(
      resourceType,
      resourceId
    );
  };

  // =========================
  // FETCH SHARES
  // =========================

  const fetchShares = async (
    resourceType: "file" | "folder",
    resourceId: string
  ) => {
    try {
      setShareLoading(true);

      const response =
        await axios.get(
          `${API}/api/shares/${resourceType}/${resourceId}`,
          {
            headers:
              getHeaders(),
          }
        );

      setShares(
        response.data.shares ||
        []
      );
    } catch (err: any) {
      console.error(
        "Failed to fetch shares:",
        err
      );

      setShares([]);

      setShareError(
        err.response?.data?.message ||
        "Failed to load shares."
      );
    } finally {
      setShareLoading(false);
    }
  };

  // =========================
  // SHARE RESOURCE
  // =========================

  const handleShare = async () => {
    if (!granteeUserId.trim()) {
      setShareError(
        "Please enter the user ID."
      );
      return;
    }

    try {
      setShareLoading(true);
      setShareMessage("");
      setShareError("");

      const response =
        await axios.post(
          `${API}/api/shares`,
          {
            resourceType:
              shareResourceType,
            resourceId:
              shareResourceId,
            granteeUserId:
              granteeUserId.trim(),
            role: shareRole,
          },
          {
            headers:
              getHeaders(),
          }
        );

      setShareMessage(
        response.data.message ||
        "Resource shared successfully."
      );

      setGranteeUserId("");

      await fetchShares(
        shareResourceType,
        shareResourceId
      );
    } catch (err: any) {
      console.error(
        "Share failed:",
        err
      );

      setShareError(
        err.response?.data?.message ||
        "Failed to share resource."
      );
    } finally {
      setShareLoading(false);
    }
  };

  // =========================
  // CHANGE PERMISSION
  // =========================

  const handlePermissionChange =
    async (
      share: ShareItem,
      newRole:
        | "viewer"
        | "editor"
    ) => {
      try {
        setShareLoading(true);
        setShareMessage("");
        setShareError("");

        await axios.post(
          `${API}/api/shares`,
          {
            resourceType:
              share.resource_type,
            resourceId:
              share.resource_id,
            granteeUserId:
              share.grantee_user_id,
            role: newRole,
          },
          {
            headers:
              getHeaders(),
          }
        );

        setShareMessage(
          "Permission updated successfully."
        );

        await fetchShares(
          shareResourceType,
          shareResourceId
        );
      } catch (err: any) {
        console.error(
          "Permission update failed:",
          err
        );

        setShareError(
          err.response?.data?.message ||
          "Failed to update permission."
        );
      } finally {
        setShareLoading(false);
      }
    };

  // =========================
  // REVOKE SHARE
  // =========================

  const handleRevokeShare =
    async (
      shareId: string
    ) => {
      try {
        setShareLoading(true);
        setShareMessage("");
        setShareError("");

        const response =
          await axios.delete(
            `${API}/api/shares/${shareId}`,
            {
              headers:
                getHeaders(),
            }
          );

        setShareMessage(
          response.data.message ||
          "Share access revoked successfully."
        );

        await fetchShares(
          shareResourceType,
          shareResourceId
        );
      } catch (err: any) {
        console.error(
          "Revoke share failed:",
          err
        );

        setShareError(
          err.response?.data?.message ||
          "Failed to revoke share."
        );
      } finally {
        setShareLoading(false);
      }
    };

  // =========================
  // CREATE PUBLIC LINK
  // =========================

  const handleCreatePublicLink =
    async () => {
      if (
        shareResourceType !==
        "file"
      ) {
        setShareError(
          "Public links are available for files."
        );
        return;
      }

      try {
        setPublicLinkLoading(
          true
        );

        setPublicLinkMessage(
          ""
        );

        setShareError("");

        const response =
          await axios.post(
            `${API}/api/public-links`,
            {
              fileId:
                shareResourceId,
              ownerId:
                USER_ID,
            }
          );

        const link =
          response.data.publicLink;

        setPublicLink(link);

        setPublicLinkMessage(
          "Public link created successfully."
        );
      } catch (err: any) {
        console.error(
          "Public link creation failed:",
          err
        );

        setShareError(
          err.response?.data?.message ||
          "Failed to create public link."
        );
      } finally {
        setPublicLinkLoading(
          false
        );
      }
    };

  // =========================
  // PUBLIC LINK URL
  // =========================

  const getPublicLinkUrl = () => {
    if (!publicLink) {
      return "";
    }

    return `${API}/api/public-links/access/${publicLink.token}`;
  };

  // =========================
  // COPY PUBLIC LINK
  // =========================

  const copyPublicLink = async () => {
    const url =
      getPublicLinkUrl();

    if (!url) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        url
      );

      setPublicLinkMessage(
        "Public link copied."
      );
    } catch {
      setPublicLinkMessage(
        "Unable to copy link."
      );
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <main className="min-h-screen bg-slate-100">

      {/* HEADER */}

      <header className="border-b bg-white px-4 py-5 sm:px-8">
        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Cloud Media Storage
            </h1>

            <p className="text-sm text-slate-500">
              Manage your files and folders
            </p>
          </div>

          <button
  onClick={handleViewProfile}
  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-semibold text-white hover:bg-blue-700"
>
  T
</button>

        </div>
      </header>

      {/* MAIN */}

      <section className="px-4 py-6 sm:px-8">

        {/* UPLOAD BOX */}

        <div
          onDragOver={(e) => {
            e.preventDefault();
          }}
          onDrop={handleDrop}
          className="mb-6 rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 text-center transition hover:border-blue-400 sm:p-8"
        >

          <div className="mb-3 text-4xl">
            ☁️
          </div>

          <h3 className="text-lg font-semibold text-slate-900">
            Drag & Drop your file here
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            or choose a file from your computer
          </p>

          <label className="mt-4 inline-block cursor-pointer rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Choose File

            <input
              type="file"
              className="hidden"
              onChange={
                handleFileSelect
              }
            />
          </label>

          {selectedFile && (
            <div className="mx-auto mt-4 max-w-md rounded-lg bg-slate-50 p-4 text-left">
              <label className="text-sm font-medium text-slate-700">
  Upload to folder
</label>

<select
  value={uploadFolderId ?? currentFolder ?? ""}
  onChange={(e) =>
    setUploadFolderId(
      e.target.value || null
    )
  }
  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
>
  <option value="">
    My Files
  </option>

  {folders.map((folder) => (
    <option
      key={folder.id}
      value={folder.id}
    >
      {folder.name}
    </option>
  ))}
</select>
              <p className="font-medium text-slate-900">
                {selectedFile.name}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {formatSize(
                  selectedFile.size
                )}
              </p>

              <button
                onClick={
                  handleUpload
                }
                disabled={
                  uploading
                }
                className="mt-4 w-full rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {uploading
                  ? "Uploading..."
                  : "Upload File"}
              </button>

              {uploading && (
                <div className="mt-4">

                  <div className="mb-1 flex justify-between text-xs text-slate-500">

                    <span>
                      Uploading...
                    </span>

                    <span>
                      {uploadProgress}%
                    </span>

                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">

                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{
                        width: `${uploadProgress}%`,
                      }}
                    />

                  </div>

                </div>
              )}

            </div>
          )}

          {message && (
            <div className="mx-auto mt-4 max-w-md rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
              {message}
            </div>
          )}

          {error && (
            <div className="mx-auto mt-4 max-w-md rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

        </div>

        {/* TRASH BUTTON */}

        <div className="mb-6 flex flex-wrap gap-3">
           <button
  onClick={() => {
    setShowCreateFolder(true);
    setFolderMessage("");
    setFolderError("");
  }}
  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
>
  + Create Folder
</button>
          <button
            onClick={() => {
              setShowTrash(false);
              fetchTrash();
            }}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            🗑️ Trash
          </button>

          {showTrash && (
            <button
              onClick={() => {
                setShowTrash(false);
                setTrashMessage("");
                setTrashError("");
              }}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              ← Back to My Files
            </button>
          )}

        </div>

        {/* TRASH SECTION */}

        {showTrash ? (
          <div className="rounded-xl border bg-white p-5 sm:p-6">

            <div className="mb-5">
              <h2 className="text-xl font-bold text-slate-900">
                🗑️ Trash
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Deleted files can be restored or permanently deleted.
              </p>
            </div>

            {trashMessage && (
              <div className="mb-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                {trashMessage}
              </div>
            )}

            {trashError && (
              <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {trashError}
              </div>
            )}

            {trashLoading ? (
              <div className="rounded-lg bg-slate-50 p-8 text-center text-slate-500">
                Loading trash...
              </div>
            ) : trashFiles.length === 0 ? (
              <div className="rounded-lg bg-slate-50 p-8 text-center text-slate-500">
                Trash is empty.
              </div>
            ) : (
              <div className="space-y-3">

                {trashFiles.map(
                  (file) => (
                    <div
                      key={file.id}
                      className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="text-2xl">
                          📄
                        </div>

                        <div className="min-w-0">

                          <p className="truncate font-medium text-slate-900">
                            {file.name}
                          </p>

                          <p className="text-sm text-slate-500">
                            {formatSize(
                              file.size_bytes
                            )}
                          </p>

                        </div>

                      </div>

                      <div className="flex flex-wrap gap-2">

                        <button
                          onClick={() =>
                            handleRestore(
                              file.id
                            )
                          }
                          className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Restore
                        </button>

                        <button
                          onClick={() =>
                            handlePermanentDelete(
                              file.id
                            )
                          }
                          className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                        >
                          Delete Permanently
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

          </div>
        ) : (
          <>

            {/* BREADCRUMBS */}

            <div className="mb-6 flex flex-wrap items-center gap-2">

              {breadcrumbs.map(
                (
                  breadcrumb,
                  index
                ) => (
                  <div
                    key={`${breadcrumb.id}-${index}`}
                    className="flex items-center gap-2"
                  >

                    <button
                      onClick={() =>
                        goToBreadcrumb(
                          index
                        )
                      }
                      className={
                        index ===
                        breadcrumbs.length - 1
                          ? "text-sm font-semibold text-slate-900"
                          : "text-sm text-blue-600 hover:underline"
                      }
                    >
                      {
                        breadcrumb.name
                      }
                    </button>

                    {index <
                      breadcrumbs.length - 1 && (
                      <span className="text-slate-400">
                        /
                      </span>
                    )}

                  </div>
                )
              )}

            </div>

            {/* SEARCH + SORT */}

            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row">

              <div className="flex-1">

                <input
                  type="text"
                  placeholder="Search files and folders..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500"
                />

              </div>

              <div className="sm:w-48">

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(
                      e.target.value
                    )
                  }
                  className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
                >
                  <option value="name">
                    Sort by Name
                  </option>

                  <option value="size">
                    Sort by Size
                  </option>

                  <option value="date">
                    Sort by Date
                  </option>
                </select>

              </div>

            </div>

            {/* CONTENT */}

            {loading ? (
              <div className="rounded-xl border bg-white p-10 text-center text-slate-500">
                Loading...
              </div>
            ) : (
              <>

                {/* FOLDERS */}

                {filteredFolders.length > 0 && (
                  <div className="mb-8">

                    <h2 className="mb-4 text-lg font-semibold text-slate-900">
                      Folders
                    </h2>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

                      {filteredFolders.map(
                        (
                          folder
                        ) => (
                          <div
                            key={
                              folder.id
                            }
                            className="rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                          >

                            <button
                              onClick={() =>
                                openFolder(
                                  folder
                                )
                              }
                              className="w-full text-left"
                            >

                              <div className="mb-3 text-4xl">
                                📁
                              </div>

                              <p className="truncate font-medium text-slate-900">
                                {
                                  folder.name
                                }
                              </p>

                              <p className="mt-1 text-xs text-slate-400">
                                Open folder
                              </p>

                            </button>

                            <div className="mt-4 grid grid-cols-2 gap-2">

                              <button
                                onClick={() =>
                                  openShareModal(
                                    "folder",
                                    folder.id,
                                    folder.name
                                  )
                                }
                                className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                              >
                                Share
                              </button>

                              <button
                                onClick={() =>
                                  handleDeleteFolder(folder.id)
                                }
                                className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                              >
                                Delete
                              </button>

                            </div>

                          </div>
                        )
                      )}

                    </div>

                  </div>
                )}

                {/* FILES */}

                <div>

                  <h2 className="mb-4 text-lg font-semibold text-slate-900">
                    Files
                  </h2>

                  {filteredFiles.length === 0 ? (
                    <div className="rounded-xl border bg-white p-10 text-center text-slate-500">
                      {searchQuery
                        ? "No matching files found"
                        : "No files in this folder"}
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border bg-white">

                      {filteredFiles.map(
                        (
                          file
                        ) => (
                          <div
                            key={
                              file.id
                            }
                            className="flex flex-col gap-4 border-b px-4 py-4 last:border-b-0 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                          >

                            <div className="flex min-w-0 items-center gap-4">

                              <div className="text-2xl">
                                📄
                              </div>

                              <div className="min-w-0">

                                <button
                                  onClick={() => handleOpenFile(file)}
                                  className="block max-w-full truncate text-left font-medium text-blue-600 hover:underline"
                                  title="Open file"
                                >
                                  {file.name}
                                </button>

                                <p className="text-sm text-slate-500">
                                  {formatSize(file.size_bytes)}
                                </p>

                              </div>

                            </div>

                            <div className="flex flex-wrap items-center gap-2 sm:justify-end">

                              <span className="mr-2 text-sm text-slate-400">
                                {new Date(
                                  file.created_at
                                ).toLocaleDateString()}
                              </span>

                              {/* OPEN BUTTON */}

                              <button
                                onClick={() => handleOpenFile(file)}
                                className="rounded-lg border border-green-200 bg-white px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-50"
                              >
                                Open
                              </button>

                              {/* VERSION BUTTON */}

                              <button
                                onClick={() =>
                                  openVersionModal(
                                    file
                                  )
                                }
                                className="rounded-lg border border-purple-200 bg-white px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50"
                              >
                                Versions
                              </button>

                              {/* SHARE BUTTON */}

                              <button
                                onClick={() =>
                                  openShareModal(
                                    "file",
                                    file.id,
                                    file.name
                                  )
                                }
                                className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                              >
                                Share
                              </button>
                              <button onClick={() => handleMoveToTrash(file.id)}
  className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50">
  Trash </button>
                            </div>

                          </div>
                        )
                      )}

                    </div>
                  )}

                </div>

              </>
            )}

          </>
        )}

      </section>
      {/* =====================================================
    CREATE FOLDER MODAL
====================================================== */}

{showCreateFolder && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          Create Folder
        </h2>

        <button
          onClick={() => {
            setShowCreateFolder(false);
            setNewFolderName("");
            setFolderError("");
          }}
          className="text-2xl text-slate-400 hover:text-slate-700"
        >
          ×
        </button>
      </div>

      <input
        type="text"
        value={newFolderName}
        onChange={(e) => setNewFolderName(e.target.value)}
        placeholder="Enter folder name"
        className="mt-5 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500"
      />

      {folderError && (
        <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {folderError}
        </div>
      )}

      <div className="mt-5 flex gap-3">

        <button
          onClick={() => {
            setShowCreateFolder(false);
            setNewFolderName("");
            setFolderError("");
          }}
          className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          onClick={handleCreateFolder}
          disabled={folderCreating}
          className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {folderCreating ? "Creating..." : "Create Folder"}
        </button>

      </div>

    </div>
  </div>
)} 
      {/* =====================================================
          VERSION MODAL
      ====================================================== */}

      {versionOpen && versionFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  File Versions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {versionFile.name}
                </p>

              </div>

              <button
                onClick={() => {
                  setVersionOpen(false);
                  setVersionFile(null);
                }}
                className="text-2xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            {/* UPLOAD NEW VERSION */}

            <div className="mt-6 rounded-lg border bg-slate-50 p-4">

              <h3 className="font-semibold text-slate-900">
                Upload New Version
              </h3>

              <input
                type="file"
                onChange={
                  handleVersionFileSelect
                }
                className="mt-3 block w-full rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-700"
              />

              {versionSelectedFile && (
                <p className="mt-2 text-sm text-slate-600">
                  Selected:{" "}
                  {versionSelectedFile.name}
                </p>
              )}

              <button
                onClick={
                  handleUploadVersion
                }
                disabled={
                  versionUploading
                }
                className="mt-3 w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
              >
                {versionUploading
                  ? "Uploading..."
                  : "Upload New Version"}
              </button>

            </div>

            {/* VERSION MESSAGES */}

            {versionMessage && (
              <div className="mt-4 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                {versionMessage}
              </div>
            )}

            {versionError && (
              <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {versionError}
              </div>
            )}

            {/* VERSION HISTORY */}

            <div className="mt-6">

              <h3 className="font-semibold text-slate-900">
                Version History
              </h3>

              {versionLoading ? (
                <p className="mt-3 text-sm text-slate-500">
                  Loading versions...
                </p>
              ) : versions.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  No versions available yet.
                </p>
              ) : (
                <div className="mt-3 space-y-3">

                  {versions.map(
                    (version) => (
                      <div
                        key={
                          version.id
                        }
                        className="rounded-lg border bg-white p-4"
                      >

                        <div className="flex items-center justify-between gap-3">

                          <div>

                            <p className="font-medium text-slate-900">
                              Version{" "}
                              {
                                version.version_number
                              }
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {formatSize(
                                version.size_bytes
                              )}
                            </p>

                            <p className="text-xs text-slate-400">
                              {new Date(
                                version.created_at
                              ).toLocaleString()}
                            </p>

                          </div>

                          <button
                            onClick={() =>
                              handleRestoreVersion(
                                version.id
                              )
                            }
                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700"
                          >
                            Restore
                          </button>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

          </div>

        </div>
      )}
      {/* =====================================================
    PROFILE MODAL
====================================================== */}

{showProfile && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

      <div className="flex items-center justify-between">

        <h2 className="text-xl font-bold text-slate-900">
          View Profile
        </h2>

        <button
          onClick={() => setShowProfile(false)}
          className="text-2xl text-slate-400 hover:text-slate-700"
        >
          ×
        </button>

      </div>

      {profileLoading ? (
        <p className="mt-6 text-center text-sm text-slate-500">
          Loading profile...
        </p>
      ) : profile ? (
        <div className="mt-6 space-y-4">

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Name
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {profile.name || "N/A"}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Email
            </p>

            <p className="mt-1 break-all font-medium text-slate-900">
              {profile.email || "N/A"}
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-xs text-slate-500">
              Role
            </p>

            <p className="mt-1 font-medium text-slate-900">
              {profile.role || "USER"}
            </p>
          </div>

        </div>
      ) : (
        <p className="mt-6 text-center text-sm text-slate-500">
          Profile information not available.
        </p>
      )}

    </div>
  </div>
)}
      {/* =====================================================
          SHARE MODAL
      ====================================================== */}

      {shareOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">

            <div className="flex items-center justify-between">

              <div>

                <h2 className="text-xl font-bold text-slate-900">
                  Share
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {shareResourceName}
                </p>

              </div>

              <button
                onClick={() =>
                  setShareOpen(
                    false
                  )
                }
                className="text-2xl text-slate-400 hover:text-slate-700"
              >
                ×
              </button>

            </div>

            {/* SHARE USER */}

            <div className="mt-6">

              <h3 className="font-semibold text-slate-900">
                Share with user
              </h3>

              <input
                type="text"
                value={
                  granteeUserId
                }
                onChange={(e) =>
                  setGranteeUserId(
                    e.target.value
                  )
                }
                placeholder="Enter user ID"
                className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500"
              />

              <div className="mt-3 flex gap-3">

                <select
                  value={
                    shareRole
                  }
                  onChange={(e) =>
                    setShareRole(
                      e.target
                        .value as
                        "viewer" |
                        "editor"
                    )
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="viewer">
                    Viewer
                  </option>

                  <option value="editor">
                    Editor
                  </option>
                </select>

                <button
                  onClick={
                    handleShare
                  }
                  disabled={
                    shareLoading
                  }
                  className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {shareLoading
                    ? "Sharing..."
                    : "Share"}
                </button>

              </div>

            </div>

            {/* EXISTING SHARES */}

            <div className="mt-8">

              <h3 className="font-semibold text-slate-900">
                Shared users
              </h3>

              {shareLoading &&
              shares.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  Loading...
                </p>
              ) : shares.length === 0 ? (
                <p className="mt-3 text-sm text-slate-500">
                  No users shared yet.
                </p>
              ) : (
                <div className="mt-3 space-y-3">

                  {shares.map(
                    (
                      share
                    ) => (
                      <div
                        key={
                          share.id
                        }
                        className="rounded-lg border bg-slate-50 p-3"
                      >

                        <p className="break-all text-sm font-medium text-slate-800">
                          {
                            share.grantee_user_id
                          }
                        </p>

                        <div className="mt-2 flex items-center gap-2">

                          <select
                            value={
                              share.role
                            }
                            onChange={(
                              e
                            ) =>
                              handlePermissionChange(
                                share,
                                e.target
                                  .value as
                                  "viewer" |
                                  "editor"
                              )
                            }
                            className="rounded-md border border-slate-300 bg-white px-2 py-1 text-sm text-slate-900"
                          >
                            <option value="viewer">
                              Viewer
                            </option>

                            <option value="editor">
                              Editor
                            </option>
                          </select>

                          <button
                            onClick={() =>
                              handleRevokeShare(
                                share.id
                              )
                            }
                            className="rounded-md border border-red-200 bg-white px-3 py-1 text-sm text-red-600 hover:bg-red-50"
                          >
                            Revoke
                          </button>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

            {/* PUBLIC LINK */}

            {shareResourceType ===
              "file" && (
              <div className="mt-8 border-t pt-6">

                <h3 className="font-semibold text-slate-900">
                  Public shareable link
                </h3>

                <button
                  onClick={
                    handleCreatePublicLink
                  }
                  disabled={
                    publicLinkLoading
                  }
                  className="mt-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
                >
                  {publicLinkLoading
                    ? "Creating..."
                    : "Create Public Link"}
                </button>

                {publicLink && (
                  <div className="mt-3 rounded-lg bg-slate-50 p-3">

                    <p className="break-all text-xs text-slate-600">
                      {
                        getPublicLinkUrl()
                      }
                    </p>

                    <button
                      onClick={
                        copyPublicLink
                      }
                      className="mt-3 rounded-md border border-slate-300 bg-white px-3 py-1 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      Copy Link
                    </button>

                  </div>
                )}

              </div>
            )}

            {/* MESSAGES */}

            {shareMessage && (
              <div className="mt-5 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                {
                  shareMessage
                }
              </div>
            )}

            {publicLinkMessage && (
              <div className="mt-3 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700">
                {
                  publicLinkMessage
                }
              </div>
            )}

            {shareError && (
              <div className="mt-3 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                {
                  shareError
                }
              </div>
            )}

          </div>

        </div>
      )}

    </main>
  );
}
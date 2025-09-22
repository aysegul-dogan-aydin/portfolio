"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useRouter } from "next/navigation";

export default function AdminNodeDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [editingExtra, setEditingExtra] = useState<any>(null);
  const [showCreateExtraForm, setShowCreateExtraForm] = useState(false);

  const node = useQuery(api.admin.adminGetNode, { id: params.id as Id<"nodes"> });
  const extras = useQuery(api.admin.adminGetNodeExtras, { nodeId: params.id as Id<"nodes"> });

  const updateNode = useMutation(api.admin.adminUpdateNode);
  const createExtra = useMutation(api.admin.adminCreateNodeExtra);
  const updateExtra = useMutation(api.admin.adminUpdateNodeExtra);
  const deleteExtra = useMutation(api.admin.adminDeleteNodeExtra);
  const reorderExtras = useMutation(api.admin.adminReorderNodeExtras);
  const generateUploadUrl = useMutation(api.admin.adminGenerateUploadUrl);
  const saveFile = useMutation(api.admin.adminSaveFile);
  const moveExtraUp = useMutation(api.admin.adminMoveExtraUp);
  const moveExtraDown = useMutation(api.admin.adminMoveExtraDown);

  const handleDeleteExtra = async (id: Id<"nodes_extras">) => {
    if (confirm("Are you sure you want to delete this extra?")) {
      await deleteExtra({ id });
    }
  };

  const handleEditExtra = (extra: any) => {
    setEditingExtra(extra);
    setShowCreateExtraForm(false);
  };

  const handleCreateExtra = () => {
    setEditingExtra(null);
    setShowCreateExtraForm(true);
  };

  const handleSaveExtra = async (extraData: any) => {
    try {
      if (editingExtra) {
        await updateExtra({ id: editingExtra._id, ...extraData });
      } else {
        await createExtra({ node_id: params.id as Id<"nodes">, ...extraData });
      }
      setEditingExtra(null);
      setShowCreateExtraForm(false);
    } catch (error) {
      console.error("Error saving extra:", error);
    }
  };

  const handleReorderExtras = async (newOrder: Id<"nodes_extras">[]) => {
    try {
      await reorderExtras({ nodeId: params.id as Id<"nodes">, extraIds: newOrder });
    } catch (error) {
      console.error("Error reordering extras:", error);
    }
  };

  const handleMoveExtraUp = async (extraId: Id<"nodes_extras">) => {
    try {
      await moveExtraUp({ extraId });
    } catch (error) {
      console.error("Error moving extra up:", error);
    }
  };

  const handleMoveExtraDown = async (extraId: Id<"nodes_extras">) => {
    try {
      await moveExtraDown({ extraId });
    } catch (error) {
      console.error("Error moving extra down:", error);
    }
  };

  if (!node) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          ← Back to Nodes
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Node Details */}
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-4">Node Details</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-sm text-gray-900">{node.name || "Untitled"}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <p className="mt-1 text-sm text-gray-900 capitalize">{node.type || "Unknown"}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <p className="mt-1 text-sm text-gray-900">{node.description || "No description"}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1 flex space-x-2">
                {node.is_recent && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Recent
                  </span>
                )}
                {node.is_video && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Video
                  </span>
                )}
              </div>
            </div>

            {node.image_url && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {node.is_video ? "Video" : "Image"}
                </label>
                {node.is_video ? (
                  <div className="mt-2 relative">
                    <video
                      src={node.image_url}
                      className="h-32 w-32 object-cover rounded-lg"
                      controls
                    />
                  </div>
                ) : (
                  <img
                    src={node.image_url}
                    alt={node.name || "Node"}
                    className="mt-2 h-32 w-32 object-cover rounded-lg"
                  />
                )}
              </div>
            )}

            {node.youtube_link && (
              <div>
                <label className="block text-sm font-medium text-gray-700">YouTube Link</label>
                <a
                  href={node.youtube_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 text-sm text-blue-600 hover:text-blue-800"
                >
                  {node.youtube_link}
                </a>
              </div>
            )}

            {node.technical && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Technical Details</label>
                <p className="mt-1 text-sm text-gray-900">{node.technical}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Created</label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(node.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

        </div>

        {/* Node Extras */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Node Extras</h2>
            <button
              onClick={handleCreateExtra}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add Extra
            </button>
          </div>

          {!extras || extras.length === 0 ? (
            <p className="text-gray-500 text-sm">No extras found for this node.</p>
          ) : (
            <div className="space-y-4">
              {extras
                .sort((a, b) => (a.index || 0) - (b.index || 0))
                .map((extra, index, sortedExtras) => (
                <div key={extra._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          #{index + 1}
                        </span>
                        {extra.is_video && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Video
                          </span>
                        )}
                      </div>
                      
                      {extra.image_url && (
                        extra.is_video ? (
                          <video
                            src={extra.image_url}
                            className="h-20 w-20 object-cover rounded-lg mb-2"
                            controls
                          />
                        ) : (
                          <img
                            src={extra.image_url}
                            alt="Extra"
                            className="h-20 w-20 object-cover rounded-lg mb-2"
                          />
                        )
                      )}
                      
                      <p className="text-sm text-gray-900 mb-1">
                        {extra.description || "No description"}
                      </p>
                      
                      {extra.technical && (
                        <p className="text-xs text-gray-600 mb-1">
                          {extra.technical}
                        </p>
                      )}
                      
                      {extra.youtube_url && (
                        <a
                          href={extra.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          YouTube Link
                        </a>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      {/* Reorder buttons */}
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleMoveExtraUp(extra._id)}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleMoveExtraDown(extra._id)}
                          disabled={index === sortedExtras.length - 1}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move down"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                      
                      {/* Action buttons */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditExtra(extra)}
                          className="text-indigo-600 hover:text-indigo-900 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteExtra(extra._id)}
                          className="text-red-600 hover:text-red-900 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Extra Form Modal */}
      {(editingExtra || showCreateExtraForm) && (
        <ExtraForm
          extra={editingExtra}
          onSave={handleSaveExtra}
          onCancel={() => {
            setEditingExtra(null);
            setShowCreateExtraForm(false);
          }}
          generateUploadUrl={generateUploadUrl}
          saveFile={saveFile}
        />
      )}
    </div>
  );
}

// Extra Form Component
function ExtraForm({ 
  extra, 
  onSave, 
  onCancel, 
  generateUploadUrl, 
  saveFile 
}: { 
  extra: any; 
  onSave: (data: any) => void; 
  onCancel: () => void;
  generateUploadUrl: any;
  saveFile: any;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    description: extra?.description || "",
    image_url: extra?.image_url || "",
    is_video: extra?.is_video || false,
    technical: extra?.technical || "",
    youtube_url: extra?.youtube_url || "",
    index: extra?.index || 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload file to Convex storage
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      const { storageId } = await result.json();
      
      // Save file info to database
      const { fileUrl } = await saveFile({
        storageId,
        filename: file.name,
        type: "extra",
        extraId: extra?._id,
      });
      
      // Update form with new image URL
      setFormData({ ...formData, image_url: fileUrl });
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {extra ? "Edit Extra" : "Create Extra"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Image</label>
              <div className="mt-1 space-y-2">
                {formData.image_url && (
                  <img
                    src={formData.image_url}
                    alt="Preview"
                    className="h-16 w-16 object-cover rounded-lg"
                  />
                )}
                <div className="flex space-x-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    {isUploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="Or enter image URL"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Index</label>
              <input
                type="number"
                value={formData.index}
                onChange={(e) => setFormData({ ...formData, index: parseInt(e.target.value) || 0 })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_video}
                  onChange={(e) => setFormData({ ...formData, is_video: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Is Video</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">YouTube URL</label>
              <input
                type="url"
                value={formData.youtube_url}
                onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Technical Details</label>
              <textarea
                value={formData.technical}
                onChange={(e) => setFormData({ ...formData, technical: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {extra ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

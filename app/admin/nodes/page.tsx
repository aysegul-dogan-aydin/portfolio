"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export default function AdminNodesPage() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [editingNode, setEditingNode] = useState<any>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [playingVideo, setPlayingVideo] = useState<any>(null);

  const nodesData = useQuery(api.admin.adminGetAllNodes, {
    search: search || undefined,
    type: typeFilter || undefined,
    limit: typeFilter ? 50 : 0, // Show more when filtering by type, no limit when showing all types
    offset: 0,
  });

  const deleteNode = useMutation(api.admin.adminDeleteNode);
  const updateNode = useMutation(api.admin.adminUpdateNode);
  const createNode = useMutation(api.admin.adminCreateNode);
  const generateUploadUrl = useMutation(api.admin.adminGenerateUploadUrl);
  const saveFile = useMutation(api.admin.adminSaveFile);
  const moveNodeUp = useMutation(api.admin.adminMoveNodeUp);
  const moveNodeDown = useMutation(api.admin.adminMoveNodeDown);

  const handleDelete = async (id: Id<"nodes">) => {
    if (confirm("Are you sure you want to delete this node?")) {
      await deleteNode({ id });
    }
  };

  const handleEdit = (node: any) => {
    setEditingNode(node);
    setShowCreateForm(false);
  };

  const handleCreate = () => {
    setEditingNode(null);
    setShowCreateForm(true);
  };

  const handleSave = async (nodeData: any) => {
    try {
      if (editingNode) {
        await updateNode({ id: editingNode._id, ...nodeData });
      } else {
        await createNode(nodeData);
      }
      setEditingNode(null);
      setShowCreateForm(false);
    } catch (error) {
      console.error("Error saving node:", error);
    }
  };

  const handleMoveUp = async (nodeId: Id<"nodes">) => {
    try {
      await moveNodeUp({ nodeId });
    } catch (error) {
      console.error("Error moving node up:", error);
    }
  };

  const handleMoveDown = async (nodeId: Id<"nodes">) => {
    try {
      await moveNodeDown({ nodeId });
    } catch (error) {
      console.error("Error moving node down:", error);
    }
  };

  if (!nodesData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Nodes</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your portfolio nodes and their properties.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleCreate}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:w-auto"
          >
            Add Node
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search nodes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">All Types</option>
            <option value="photo">Photo</option>
            <option value="video">Video</option>
            <option value="audio">Audio</option>
            <option value="performance">Performance</option>
            <option value="installation">Installation</option>
            <option value="oil">Oil</option>
            <option value="drawing">Drawing</option>
            <option value="abstract">Abstract</option>
            <option value="digital">Digital</option>
            <option value="sculpture">Sculpture</option>
          </select>
        </div>
      </div>

      {/* Node Form Modal */}
      {(editingNode || showCreateForm) && (
        <NodeForm
          node={editingNode}
          onSave={handleSave}
          onCancel={() => {
            setEditingNode(null);
            setShowCreateForm(false);
          }}
          generateUploadUrl={generateUploadUrl}
          saveFile={saveFile}
        />
      )}

      {/* Content Area */}
      <div className="mt-8">
        {!typeFilter ? (
          /* Show Type Overview */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[
              { type: "photo", label: "Photo", color: "bg-blue-500" },
              { type: "video", label: "Video", color: "bg-purple-500" },
              { type: "audio", label: "Audio", color: "bg-green-500" },
              { type: "performance", label: "Performance", color: "bg-yellow-500" },
              { type: "installation", label: "Installation", color: "bg-red-500" },
              { type: "oil", label: "Oil", color: "bg-orange-500" },
              { type: "drawing", label: "Drawing", color: "bg-pink-500" },
              { type: "abstract", label: "Abstract", color: "bg-indigo-500" },
              { type: "digital", label: "Digital", color: "bg-teal-500" },
              { type: "sculpture", label: "Sculpture", color: "bg-gray-500" },
            ].map((typeInfo) => {
              const typeNodes = nodesData?.nodes.filter(node => node.type === typeInfo.type) || [];
              return (
                <div
                  key={typeInfo.type}
                  onClick={() => setTypeFilter(typeInfo.type)}
                  className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${typeInfo.color} rounded-lg flex items-center justify-center`}>
                      <span className="text-white font-bold text-lg">
                        {typeInfo.label.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 capitalize">
                        {typeInfo.label}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {typeNodes.length} {typeNodes.length === 1 ? 'node' : 'nodes'}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Show Filtered Nodes */
          <div className="flex flex-col">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 capitalize">
                {typeFilter} Nodes ({nodesData?.nodes.length || 0})
              </h2>
              <button
                onClick={() => setTypeFilter("")}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Back to All Types
              </button>
            </div>
            
            <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-300">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Node
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Order
                        </th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {nodesData?.nodes
                        .sort((a, b) => (a.index || 0) - (b.index || 0))
                        .map((node, index, sortedNodes) => (
                        <tr key={node._id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                {node.image_url ? (
                                  <img
                                    className="h-10 w-10 rounded-lg object-cover"
                                    src={node.image_url}
                                    alt={node.name || "Node"}
                                  />
                                ) : node.is_video ? (
                                  <button
                                    onClick={() => setPlayingVideo(node)}
                                    className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center relative hover:bg-purple-200 transition-colors"
                                  >
                                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M8 5v10l8-5-8-5z"/>
                                    </svg>
                                  </button>
                                ) : (
                                  <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">No Image</span>
                                  </div>
                                )}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {node.name || "Untitled"}
                                </div>
                                <div className="text-sm text-gray-500 truncate max-w-xs">
                                  {node.description || "No description"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex space-x-2">
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
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(node.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              #{index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              {/* Reorder buttons */}
                              <div className="flex flex-col space-y-1">
                                <button
                                  onClick={() => handleMoveUp(node._id)}
                                  disabled={index === 0}
                                  className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                  title="Move up"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleMoveDown(node._id)}
                                  disabled={index === sortedNodes.length - 1}
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
                                <a
                                  href={`/admin/nodes/${node._id}`}
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Extras
                                </a>
                                <button
                                  onClick={() => handleEdit(node)}
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(node._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {playingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {playingVideo.name || "Video"}
              </h3>
              <button
                onClick={() => setPlayingVideo(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="aspect-video bg-black rounded-lg overflow-hidden">
              {playingVideo.youtube_link ? (
                <iframe
                  src={playingVideo.youtube_link.replace('watch?v=', 'embed/')}
                  title={playingVideo.name || "Video"}
                  className="w-full h-full"
                  allowFullScreen
                />
              ) : playingVideo.image_url ? (
                <video
                  src={playingVideo.image_url}
                  controls
                  className="w-full h-full"
                >
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white">
                  <p>No video source available</p>
                </div>
              )}
            </div>
            
            {playingVideo.description && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">{playingVideo.description}</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}

// Node Form Component
function NodeForm({ 
  node, 
  onSave, 
  onCancel, 
  generateUploadUrl, 
  saveFile 
}: { 
  node: any; 
  onSave: (data: any) => void; 
  onCancel: () => void;
  generateUploadUrl: any;
  saveFile: any;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: node?.name || "",
    description: node?.description || "",
    image_url: node?.image_url || "",
    type: node?.type || "",
    is_recent: node?.is_recent || false,
    recent_index: node?.recent_index || 0,
    is_video: node?.is_video || false,
    technical: node?.technical || "",
    youtube_link: node?.youtube_link || "",
    recent_work_date: node?.recent_work_date || "",
    visible_date: node?.visible_date || "",
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
        type: "node",
        nodeId: node?._id,
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
            {node ? "Edit Node" : "Create Node"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
            </div>
            
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
                    accept="image/*,video/*"
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
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="">Select Type</option>
                <option value="photo">Photo</option>
                <option value="video">Video</option>
                <option value="audio">Audio</option>
                <option value="performance">Performance</option>
                <option value="installation">Installation</option>
                <option value="oil">Oil</option>
                <option value="drawing">Drawing</option>
                <option value="abstract">Abstract</option>
                <option value="digital">Digital</option>
                <option value="sculpture">Sculpture</option>
              </select>
            </div>

            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_recent}
                  onChange={(e) => setFormData({ ...formData, is_recent: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Recent</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.is_video}
                  onChange={(e) => setFormData({ ...formData, is_video: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">Video</span>
              </label>
            </div>

            {formData.is_recent && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Recent Order</label>
                <input
                  type="number"
                  value={formData.recent_index}
                  onChange={(e) => setFormData({ ...formData, recent_index: parseInt(e.target.value) || 0 })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  min="1"
                  placeholder="Order in recent items (1 = first)"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Lower numbers appear first in the recent items list. Use the "Recent Order" page to manage order easily.
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">YouTube Link</label>
              <input
                type="url"
                value={formData.youtube_link}
                onChange={(e) => setFormData({ ...formData, youtube_link: e.target.value })}
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
                {node ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

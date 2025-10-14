"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

// Force dynamic rendering to prevent static generation issues
export const dynamic = 'force-dynamic';

export default function AdminRecentPage() {
  const [playingVideo, setPlayingVideo] = useState<any>(null);

  // Get all nodes and filter for recent ones
  const allNodes = useQuery(api.admin.adminGetAllNodes, { limit: 0 });
  const recentItems = allNodes?.nodes.filter(node => node.is_recent) || [];

  const handleMoveUp = async (nodeId: Id<"nodes">) => {
    // For now, just show a message that this feature needs to be implemented
    alert("Recent ordering feature has been removed. You can manage order by editing the 'Recent Order' field in the node edit form.");
  };

  const handleMoveDown = async (nodeId: Id<"nodes">) => {
    // For now, just show a message that this feature needs to be implemented
    alert("Recent ordering feature has been removed. You can manage order by editing the 'Recent Order' field in the node edit form.");
  };

  if (!allNodes) {
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
          <h1 className="text-2xl font-semibold text-gray-900">Recent Items Order</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage the order of items displayed in the "Recent Works" section.
          </p>
        </div>
      </div>

      {/* Recent Items List */}
      <div className="mt-8">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Recent Items ({recentItems.length})
          </h2>
          <p className="text-sm text-gray-500">
            Use the up/down arrows to reorder items in the "Recent Works" section.
          </p>
        </div>
        
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Order
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentItems.map((item, index) => (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      #{index + 1}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {item.image_url ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover"
                            src={item.image_url}
                            alt={item.name || "Item"}
                          />
                        ) : item.is_video ? (
                          <button
                            onClick={() => setPlayingVideo(item)}
                            className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center relative hover:bg-purple-200 transition-colors"
                          >
                            <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M8 5v10l8-5-8-5z"/>
                            </svg>
                          </button>
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {item.name || "Untitled"}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {item.description || "No description"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                      {item.type || "Unknown"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {item.is_recent && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Recent
                        </span>
                      )}
                      {item.is_video && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          Video
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* Reorder buttons */}
                      <div className="flex flex-col space-y-1">
                        <button
                          onClick={() => handleMoveUp(item._id)}
                          disabled={index === 0}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                          title="Move up"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleMoveDown(item._id)}
                          disabled={index === recentItems.length - 1}
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
                          href={`/admin/nodes/${item._id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </a>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

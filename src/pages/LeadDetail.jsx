import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare, CheckSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

const LeadDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    loadLeadData();
  }, [id]);

  const loadLeadData = () => {
    const storedLeads = JSON.parse(localStorage.getItem('empire_leads') || '[]');
    const foundLead = storedLeads.find(l => l.id === id);
    setLead(foundLead);

    const storedMessages = JSON.parse(localStorage.getItem('empire_messages') || '[]');
    const leadMessages = storedMessages.filter(m => m.lead_id === id);
    setMessages(leadMessages);

    const storedTasks = JSON.parse(localStorage.getItem('empire_tasks') || '[]');
    const leadTasks = storedTasks.filter(t => t.lead_id === id);
    setTasks(leadTasks);
  };

  if (!lead) {
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <p className="text-xl text-gray-600">Lead not found</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{lead.title} - Lead Details</title>
        <meta name="description" content={`Details for lead: ${lead.title}`} />
      </Helmet>

      <div className="p-8 bg-gray-100 text-gray-900 min-h-screen">
        <Button
          variant="ghost"
          onClick={() => navigate('/leads/table')}
          className="mb-6 text-base text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Leads
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{lead.title}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <p className="text-base text-gray-600 mb-1 font-medium">Status</p>
                <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
                  lead.status === 'new' ? 'bg-blue-100 text-blue-700' :
                  lead.status === 'contacted' ? 'bg-purple-100 text-purple-700' :
                  lead.status === 'in_process' ? 'bg-yellow-100 text-yellow-700' :
                  lead.status === 'booked' ? 'bg-green-100 text-green-700' :
                  lead.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {lead.status}
                </span>
              </div>
              <div>
                <p className="text-base text-gray-600 mb-1 font-medium">Value</p>
                <p className="text-xl font-bold text-gray-900">${lead.value || 0}</p>
              </div>
              <div>
                <p className="text-base text-gray-600 mb-1 font-medium">Contact</p>
                <p className="text-lg text-gray-900">{lead.contact_name || '-'}</p>
              </div>
              <div>
                <p className="text-base text-gray-600 mb-1 font-medium">Created</p>
                <p className="text-lg text-gray-900">{new Date(lead.created_at).toLocaleDateString()}</p>
              </div>
              {lead.project_id && (
                 <div>
                 <p className="text-base text-gray-600 mb-1 font-medium">Project</p>
                 <p className="text-lg text-gray-900">
                    {JSON.parse(localStorage.getItem('empire_projects') || '[]').find(p => p.id === lead.project_id)?.name || 'N/A'}
                 </p>
               </div>
              )}
            </div>

            {lead.description && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-base text-gray-600 mb-1 font-medium">Description</p>
                <p className="text-lg text-gray-900">{lead.description}</p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Related Messages</h2>
              </div>
              {messages.length === 0 ? (
                <p className="text-lg text-gray-600">No messages linked to this lead</p>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-base text-gray-900 mb-1">{msg.content}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(msg.created_at).toLocaleString()} - <span className="capitalize">{msg.direction}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckSquare className="w-6 h-6 text-gray-600" />
                <h2 className="text-xl font-semibold text-gray-900">Related Tasks</h2>
              </div>
              {tasks.length === 0 ? (
                <p className="text-lg text-gray-600">No tasks linked to this lead</p>
              ) : (
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {tasks.map((task) => (
                    <div key={task.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-base font-medium text-gray-900 mb-1">{task.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          task.status === 'open' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {task.status}
                        </span>
                        <span className="text-sm text-gray-600">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default LeadDetail;
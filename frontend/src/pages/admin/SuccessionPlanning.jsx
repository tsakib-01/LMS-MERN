import { useState } from 'react';
import { Users, TrendingUp, AlertCircle, CheckCircle, Plus, X, Calendar } from 'lucide-react';

export default function SuccessionPlanner() {
  const [activeTab, setActiveTab] = useState('overview');
  const [positions, setPositions] = useState([
    {
      id: 1,
      title: 'CEO',
      currentHolder: 'John Smith',
      riskLevel: 'high',
      timeframe: '1-2 years',
      successors: [
        { name: 'Sarah Johnson', readiness: 'Ready Now', probability: 85 },
        { name: 'Michael Chen', readiness: '6-12 months', probability: 70 }
      ],
      developmentPlan: 'Executive leadership program, board exposure',
      retirementDate: '2026-12-31'
    },
    {
      id: 2,
      title: 'CTO',
      currentHolder: 'Emily Davis',
      riskLevel: 'medium',
      timeframe: '2-3 years',
      successors: [
        { name: 'David Park', readiness: '1-2 years', probability: 75 }
      ],
      developmentPlan: 'Technical architecture training, vendor management',
      retirementDate: '2027-06-30'
    }
  ]);

  const [showAddPosition, setShowAddPosition] = useState(false);
  const [newPosition, setNewPosition] = useState({
    title: '',
    currentHolder: '',
    riskLevel: 'medium',
    timeframe: '2-3 years',
    successors: [],
    developmentPlan: '',
    retirementDate: ''
  });

  const handleAddPosition = () => {
    if (newPosition.title && newPosition.currentHolder) {
      setPositions([...positions, { ...newPosition, id: Date.now() }]);
      setNewPosition({
        title: '',
        currentHolder: '',
        riskLevel: 'medium',
        timeframe: '2-3 years',
        successors: [],
        developmentPlan: '',
        retirementDate: ''
      });
      setShowAddPosition(false);
    }
  };

  const handleDeletePosition = (id) => {
    setPositions(positions.filter(p => p.id !== id));
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 border-green-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getReadinessColor = (readiness) => {
    if (readiness.includes('Ready')) return 'text-green-600 font-semibold';
    if (readiness.includes('6-12')) return 'text-yellow-600 font-semibold';
    return 'text-orange-600 font-semibold';
  };

  const stats = {
    totalPositions: positions.length,
    highRisk: positions.filter(p => p.riskLevel === 'high').length,
    readySuccessors: positions.reduce((acc, p) => 
      acc + p.successors.filter(s => s.readiness === 'Ready Now').length, 0),
    avgReadiness: Math.round(
      positions.reduce((acc, p) => 
        acc + p.successors.reduce((sum, s) => sum + s.probability, 0) / (p.successors.length || 1), 0
      ) / (positions.length || 1)
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-8 shadow-lg">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-2">Succession Planning</h1>
          <p className="text-indigo-100">Strategic talent pipeline management</p>
        </div>
      </div>

      {/* Stats Dashboard */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 mb-8">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Key Positions</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalPositions}</p>
              </div>
              <Users className="text-indigo-500" size={40} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">High Risk</p>
                <p className="text-3xl font-bold text-gray-900">{stats.highRisk}</p>
              </div>
              <AlertCircle className="text-red-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Ready Now</p>
                <p className="text-3xl font-bold text-gray-900">{stats.readySuccessors}</p>
              </div>
              <CheckCircle className="text-green-500" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Avg Readiness</p>
                <p className="text-3xl font-bold text-gray-900">{stats.avgReadiness}%</p>
              </div>
              <TrendingUp className="text-blue-500" size={40} />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-8">
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === 'overview'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === 'timeline'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Timeline
            </button>
            <button
              onClick={() => setActiveTab('development')}
              className={`px-6 py-4 font-semibold transition ${
                activeTab === 'development'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Development Plans
            </button>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Key Positions</h2>
              <button
                onClick={() => setShowAddPosition(true)}
                className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
              >
                <Plus size={20} />
                Add Position
              </button>
            </div>

            {/* Add Position Modal */}
            {showAddPosition && (
              <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-indigo-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">Add New Position</h3>
                  <button onClick={() => setShowAddPosition(false)} className="text-gray-400 hover:text-gray-600">
                    <X size={24} />
                  </button>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Position Title</label>
                    <input
                      type="text"
                      value={newPosition.title}
                      onChange={(e) => setNewPosition({...newPosition, title: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., CFO"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Current Holder</label>
                    <input
                      type="text"
                      value={newPosition.currentHolder}
                      onChange={(e) => setNewPosition({...newPosition, currentHolder: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., Jane Doe"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Risk Level</label>
                    <select
                      value={newPosition.riskLevel}
                      onChange={(e) => setNewPosition({...newPosition, riskLevel: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Retirement Date</label>
                    <input
                      type="date"
                      value={newPosition.retirementDate}
                      onChange={(e) => setNewPosition({...newPosition, retirementDate: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">Development Plan</label>
                    <textarea
                      value={newPosition.developmentPlan}
                      onChange={(e) => setNewPosition({...newPosition, developmentPlan: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg"
                      rows="2"
                      placeholder="Key development activities..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => setShowAddPosition(false)}
                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddPosition}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add Position
                  </button>
                </div>
              </div>
            )}

            {/* Position Cards */}
            {positions.map((position) => (
              <div key={position.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">{position.title}</h3>
                    <p className="text-gray-600">Current: {position.currentHolder}</p>
                    {position.retirementDate && (
                      <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                        <Calendar size={14} />
                        Retirement: {new Date(position.retirementDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getRiskColor(position.riskLevel)}`}>
                      {position.riskLevel.toUpperCase()} RISK
                    </span>
                    <button
                      onClick={() => handleDeletePosition(position.id)}
                      className="text-gray-400 hover:text-red-600 transition"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Successor Candidates</h4>
                    <div className="space-y-3">
                      {position.successors.length > 0 ? (
                        position.successors.map((successor, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium text-gray-900">{successor.name}</p>
                              <p className={`text-sm ${getReadinessColor(successor.readiness)}`}>
                                {successor.readiness}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-gray-900">{successor.probability}%</div>
                              <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full"
                                  style={{ width: `${successor.probability}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500 italic">No successors identified</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Development Plan</h4>
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-gray-700">{position.developmentPlan || 'No plan specified'}</p>
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      <p><strong>Timeframe:</strong> {position.timeframe}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Succession Timeline</h2>
            <div className="space-y-4">
              {positions
                .filter(p => p.retirementDate)
                .sort((a, b) => new Date(a.retirementDate) - new Date(b.retirementDate))
                .map((position) => (
                  <div key={position.id} className="flex items-center gap-4 p-4 border-l-4 border-indigo-500 bg-gray-50 rounded-r-lg">
                    <div className="flex-shrink-0 w-32">
                      <p className="text-sm font-semibold text-gray-600">
                        {new Date(position.retirementDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold text-gray-900">{position.title}</p>
                      <p className="text-sm text-gray-600">{position.currentHolder} → {position.successors[0]?.name || 'TBD'}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskColor(position.riskLevel)}`}>
                      {position.riskLevel}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Development Plans Tab */}
        {activeTab === 'development' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Development Plans</h2>
            {positions.map((position) => (
              <div key={position.id} className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{position.title}</h3>
                <div className="space-y-4">
                  {position.successors.map((successor, idx) => (
                    <div key={idx} className="border-l-4 border-indigo-500 pl-4 py-2">
                      <p className="font-semibold text-gray-900">{successor.name}</p>
                      <p className="text-sm text-gray-600 mt-1">{position.developmentPlan}</p>
                      <div className="mt-2 flex items-center gap-4">
                        <span className={`text-sm ${getReadinessColor(successor.readiness)}`}>
                          {successor.readiness}
                        </span>
                        <span className="text-sm text-gray-500">Readiness: {successor.probability}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
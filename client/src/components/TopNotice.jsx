import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { FiX, FiInfo, FiAlertTriangle, FiCheckCircle, FiAlertCircle, FiMegaphone } from 'react-icons/fi';

function TopNotice() {
  const [notices, setNotices] = useState([]);
  const [dismissed, setDismissed] = useState([]);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const { data } = await api.get('/content/notices?position=top_bar');
      setNotices(data);
    } catch (error) {
      // Silently fail - notices are not critical
    }
  };

  const handleDismiss = (noticeId) => {
    setDismissed([...dismissed, noticeId]);
  };

  const getIcon = (type) => {
    switch (type) {
      case 'warning': return <FiAlertTriangle className="flex-shrink-0" />;
      case 'error': return <FiAlertCircle className="flex-shrink-0" />;
      case 'success': return <FiCheckCircle className="flex-shrink-0" />;
      case 'announcement': return <FiMegaphone className="flex-shrink-0" />;
      default: return <FiInfo className="flex-shrink-0" />;
    }
  };

  const getColors = (type) => {
    switch (type) {
      case 'warning': return 'bg-yellow-500 text-yellow-900';
      case 'error': return 'bg-red-500 text-white';
      case 'success': return 'bg-green-500 text-white';
      case 'announcement': return 'bg-purple-500 text-white';
      default: return 'bg-blue-500 text-white';
    }
  };

  const visibleNotices = notices.filter(n => !dismissed.includes(n._id));

  if (visibleNotices.length === 0) return null;

  return (
    <div className="space-y-0">
      {visibleNotices.map(notice => (
        <div key={notice._id} className={`${getColors(notice.type)} py-2 px-4`}>
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getIcon(notice.type)}
              <span className="text-sm font-medium">{notice.title}</span>
              <span className="text-sm opacity-90">— {notice.content}</span>
              {notice.link && (
                <Link to={notice.link} className="text-sm underline ml-2">
                  {notice.linkText || 'Learn more'}
                </Link>
              )}
            </div>
            {notice.isDismissible && (
              <button onClick={() => handleDismiss(notice._id)} className="p-1 hover:opacity-70">
                <FiX />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TopNotice;

import React, { useState, useRef } from 'react';
import { FiChevronLeft, FiChevronRight, FiPlus } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const Stories = () => {
  const scrollContainerRef = useRef(null);
  const { user } = useAuth();
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Mock stories data
  const stories = [
    { id: 1, name: 'Your Story', avatar: user?.name?.charAt(0) || 'U', isOwnStory: true },
    { id: 2, name: 'John_Doe', avatar: 'J', hasStory: true, viewed: false },
    { id: 3, name: 'Sarah_Smith', avatar: 'S', hasStory: true, viewed: false },
    { id: 4, name: 'Mike_Johnson', avatar: 'M', hasStory: true, viewed: true },
    { id: 5, name: 'Emma_Wilson', avatar: 'E', hasStory: true, viewed: false },
    { id: 6, name: 'Alex_Brown', avatar: 'A', hasStory: true, viewed: true },
  ];

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    const newScrollPosition = 
      direction === 'left' 
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scroll({
      left: newScrollPosition,
      behavior: 'smooth'
    });

    setTimeout(() => updateScrollButtons(), 300);
  };

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 10
    );
  };

  return (
    <div className="stories-container">
      <div className="stories-wrapper">
        {canScrollLeft && (
          <button 
            className="stories-scroll-btn stories-scroll-left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <FiChevronLeft />
          </button>
        )}

        <div 
          className="stories-list"
          ref={scrollContainerRef}
          onScroll={updateScrollButtons}
        >
          {stories.map((story) => (
            <div 
              key={story.id}
              className={`story-item ${story.isOwnStory ? 'own-story' : ''} ${story.viewed ? 'viewed' : ''}`}
            >
              {story.isOwnStory ? (
                <div className="story-content own">
                  <div className="story-avatar">
                    {story.avatar}
                  </div>
                  <button className="add-story-btn">
                    <FiPlus />
                  </button>
                </div>
              ) : (
                <div className={`story-content ${story.viewed ? 'viewed' : 'unviewed'}`}>
                  <div className="story-backdrop">
                    <div 
                      className="story-gradient"
                      style={{
                        background: `linear-gradient(135deg, hsl(${Math.random() * 360}, 70%, 50%), hsl(${Math.random() * 360}, 70%, 50%))`
                      }}
                    />
                  </div>
                  <div className="story-avatar">
                    {story.avatar}
                  </div>
                </div>
              )}
              <p className="story-name">{story.name}</p>
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button 
            className="stories-scroll-btn stories-scroll-right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <FiChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default Stories;

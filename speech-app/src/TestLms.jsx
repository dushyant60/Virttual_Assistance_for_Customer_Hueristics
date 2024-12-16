import React from 'react';

function Navbar() {
  return (
    <nav className="navbar fixed-top navbar-light bg-white navbar-expand" aria-label="Site navigation">
      <button className="navbar-toggler aabtn d-block d-md-none px-1 my-1 border-0" data-toggler="drawers" data-action="toggle" data-target="theme_boost-drawers-primary">
        <span className="navbar-toggler-icon"></span>
        <span className="sr-only">Side panel</span>
      </button>

      <a href="http://localhost/moodlemysite/my/" className="navbar-brand d-none d-md-flex align-items-center m-0 mr-4 p-0 aabtn">
        LMS
      </a>

      <div className="primary-navigation">
        <nav className="moremenu navigation">
          <ul id="moremenu-660f89dd46cf9-navbar-nav" role="menubar" className="nav more-nav navbar-nav">
            <li data-key="home" className="nav-item" role="none" data-forceintomoremenu="false">
              <a role="menuitem" className="nav-link" href="http://localhost/moodlemysite/?redirect=0" tabIndex="-1">
                Home
              </a>
            </li>
            <li data-key="myhome" className="nav-item" role="none" data-forceintomoremenu="false">
              <a role="menuitem" className="nav-link" href="http://localhost/moodlemysite/my/" tabIndex="-1">
                Dashboard
              </a>
            </li>
            <li data-key="mycourses" className="nav-item" role="none" data-forceintomoremenu="false">
              <a role="menuitem" className="nav-link active" href="http://localhost/moodlemysite/my/courses.php" aria-current="true">
                My courses
              </a>
            </li>
            <li data-key="siteadminnode" className="nav-item" role="none" data-forceintomoremenu="false">
              <a role="menuitem" className="nav-link" href="http://localhost/moodlemysite/admin/search.php" tabIndex="-1">
                Site administration
              </a>
            </li>
            <li role="none" className="nav-item dropdown dropdownmoremenu d-none" data-region="morebutton">
              <a className="dropdown-toggle nav-link" href="#" id="moremenu-dropdown-660f89dd46cf9" role="menuitem" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" tabIndex="-1">
                More
              </a>
              <ul className="dropdown-menu dropdown-menu-left" data-region="moredropdown" aria-labelledby="moremenu-dropdown-660f89dd46cf9" role="menu">
              </ul>
            </li>
          </ul>
        </nav>
      </div>

      <ul className="navbar-nav d-none d-md-flex my-1 px-1">
        {/* page_heading_menu */}
      </ul>

      <div id="usernavigation" className="navbar-nav ml-auto">
        {/* User navigation content */}
      </div>
    </nav>
  );
}

export default Navbar;

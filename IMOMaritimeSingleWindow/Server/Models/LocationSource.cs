﻿using System;
using System.Collections.Generic;

namespace IMOMaritimeSingleWindow.Models
{
    public partial class LocationSource
    {
        public LocationSource()
        {
            Location = new HashSet<Location>();
        }

        public int LocationSourceId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }

        public ICollection<Location> Location { get; set; }
    }
}

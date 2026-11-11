variable "queue_name" {
  type = string
}

variable "fifo" {
  type    = bool
  default = false
}

variable "message_retention_seconds" {
  type    = number
  default = 864000
}

variable "max_receive_count" {
  type    = number
  default = 4
}

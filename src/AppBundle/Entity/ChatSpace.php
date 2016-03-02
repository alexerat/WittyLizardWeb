<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * ChatSpace
 *
 * @ORM\Table(name="Online_Comms.Chat_Space", indexes={@ORM\Index(name="fk_Chat_Space_Tutorial_Room_Table1_idx", columns={"Room_ID"}), @ORM\Index(name="fk_Chat_Space_User_Table1_idx", columns={"User_ID"})})
 * @ORM\Entity
 */
class ChatSpace
{

    /**
     * @var \AppBundle\Entity\TutorialRoomTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\TutorialRoomTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Room_ID", referencedColumnName="Room_ID")
     * })
     */
    private $roomId;

    /**
     * @var \AppBundle\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="User_ID", referencedColumnName="User_ID")
     * })
     */
    private $user;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Post_Time", type="datetime")
    */
    private $postTime;

    /**
     * @var string
     *
     * @ORM\Column(name="Chat_Data", type="string", length=200, nullable=true)
     */
    private $chatData;

    /**
     * Set postTime
     *
     * @param \DateTime $postTime
     *
     * @return ChatSpace
     */
    public function setPostTime($postTime)
    {
        $this->postTime = $postTime;

        return $this;
    }

    /**
     * Get postTime
     *
     * @return \DateTime
     */
    public function getPostTime()
    {
        return $this->postTime;
    }

    /**
     * Set chatData
     *
     * @param string $chatData
     *
     * @return ChatSpace
     */
    public function setChatData($chatData)
    {
        $this->chatData = $chatData;

        return $this;
    }

    /**
     * Get chatData
     *
     * @return string
     */
    public function getChatData()
    {
        return $this->chatData;
    }

    /**
     * Set roomId
     *
     * @param \AppBundle\Entity\TutorialRoomTable $roomId
     *
     * @return ChatSpace
     */
    public function setRoomId(\AppBundle\Entity\TutorialRoomTable $roomId = null)
    {
        $this->roomId = $roomId;

        return $this;
    }

    /**
     * Get roomId
     *
     * @return \AppBundle\Entity\TutorialRoomTable
     */
    public function getRoomId()
    {
        return $this->roomId;
    }

    /**
     * Set user
     *
     * @param \AppBundle\Entity\UserTable $user
     *
     * @return ChatSpace
     */
    public function setUser(\AppBundle\Entity\UserTable $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \AppBundle\Entity\UserTable
     */
    public function getUser()
    {
        return $this->user;
    }
}

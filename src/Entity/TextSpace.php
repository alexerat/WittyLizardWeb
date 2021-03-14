<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * TextSpace
 *
 * @ORM\Table(name="Online_Comms.Text_Space", indexes={@ORM\Index(name="fk_Text_Space_Tutorial_Room_Table1_idx", columns={"Room_ID"}), @ORM\Index(name="fk_Text_Space_User_Table1_idx", columns={"User_ID"})})
 * @ORM\Entity
 */
class TextSpace
{

    /**
     * @var \App\Entity\TutorialRoomTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\TutorialRoomTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Room_ID", referencedColumnName="Room_ID")
     * })
     */
    private $roomId;

    /**
     * @var \App\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="App\Entity\UserTable")
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
     * @ORM\Column(name="Text_Data", type="string", length=200, nullable=true)
     */
    private $chatData;

    /**
     * Set postTime
     *
     * @param \DateTime $postTime
     *
     * @return TextSpace
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
     * @return TextSpace
     */
    public function setTextData($chatData)
    {
        $this->chatData = $chatData;

        return $this;
    }

    /**
     * Get chatData
     *
     * @return string
     */
    public function getTextData()
    {
        return $this->chatData;
    }

    /**
     * Set roomId
     *
     * @param \App\Entity\TutorialRoomTable $roomId
     *
     * @return TextSpace
     */
    public function setRoomId(\App\Entity\TutorialRoomTable $roomId = null)
    {
        $this->roomId = $roomId;

        return $this;
    }

    /**
     * Get roomId
     *
     * @return \App\Entity\TutorialRoomTable
     */
    public function getRoomId()
    {
        return $this->roomId;
    }

    /**
     * Set user
     *
     * @param \App\Entity\UserTable $user
     *
     * @return TextSpace
     */
    public function setUser(\App\Entity\UserTable $user = null)
    {
        $this->user = $user;

        return $this;
    }

    /**
     * Get user
     *
     * @return \App\Entity\UserTable
     */
    public function getUser()
    {
        return $this->user;
    }
}

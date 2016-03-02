<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * UserSessions
 *
 * @ORM\Table(name="Users.User_Sessions")
 * @ORM\Entity
 */
class UserSessions
{
    /**
     * @var string
     *
     * @ORM\Column(name="Session_ID", type="string", length=256, nullable=false)
     * @ORM\Id
     */
    private $sessionId;

    /**
     * @var resource
     *
     * @ORM\Column(name="Session_Data", type="blob")
     */
    private $sessData;

    /**
     * @var integer
     *
     * @ORM\Column(name="Session_Time", type="int")
     */
    private $startTime;

    /**
     * @var integer
     *
     * @ORM\Column(name="Session_Lifetime", type="int")
     */
    private $dropTime;



    /**
     * Set sessionId
     *
     * @param string $sessionId
     *
     * @return UserSessions
     */
    public function setSessionId($sessionId)
    {
        $this->sessionId = $sessionId;

        return $this;
    }

    /**
     * Get sessionId
     *
     * @return string
     */
    public function getSessionId()
    {
        return $this->sessionId;
    }


    /**
     * Set sessData
     *
     * @param string $sessData
     *
     * @return UserSessions
     */
    public function setSessData($sessData)
    {
        $this->sessData = $sessData;

        return $this;
    }

    /**
     * Get sessData
     *
     * @return string
     */
    public function getSessData()
    {
        return $this->sessData;
    }

    /**
     * Set startTime
     *
     * @param \DateTime $startTime
     *
     * @return UserSessions
     */
    public function setStartTime($startTime)
    {
        $this->startTime = $startTime;

        return $this;
    }

    /**
     * Get startTime
     *
     * @return \DateTime
     */
    public function getStartTime()
    {
        return $this->startTime;
    }

    /**
     * Set dropTime
     *
     * @param \DateTime $dropTime
     *
     * @return UserSessions
     */
    public function setDropTime($dropTime)
    {
        $this->dropTime = $dropTime;

        return $this;
    }

    /**
     * Get dropTime
     *
     * @return \DateTime
     */
    public function getDropTime()
    {
        return $this->dropTime;
    }
}
